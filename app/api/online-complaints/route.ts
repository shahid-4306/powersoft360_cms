

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint";
import { getGridFS } from "@/lib/gridfs";
import { validateFileType, validateFileSize } from "@/lib/downloadUtils";
import { verifyToken } from "@/lib/jwt";
import { sendComplaintEmail } from "@/lib/email-service";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";
import { isValidActiveComplaintType } from "@/lib/complaintTypes";
import { notifyComplaintCreated } from "@/lib/notification-events";
import { pushComplaintHistory } from "@/lib/complaint-history";

// ======================================================
// POST → REGISTER NEW COMPLAINT
// ======================================================
export async function POST(request: Request) {
  console.log("=== ONLINE COMPLAINT REGISTER API ===");

  try {
    await dbConnect();

    const formData = await request.formData();

    // ============================
    // Verify JWT (optional)
    // ============================
    // The email-verification gate in front of this form was removed, so a
    // customer session/token is no longer required to submit a complaint.
    // If a request still carries one (a verified account submitting the
    // form), it's honored and the complaint gets linked to that account;
    // otherwise the complaint is simply saved without a submittedByUserId.
    const authHeader = formData.get("authorization") as string;
    let userId: string | undefined;
    if (authHeader) {
      try {
        const decoded = verifyToken(authHeader);
        userId = decoded.userId;
      } catch {
        // Invalid/expired token on an otherwise-open submission: ignore it
        // rather than blocking the complaint.
        userId = undefined;
      }
    }

    // Required fields
    const rawCompany = formData.get("company") as string;
    const softwareType = formData.get("softwareType") as string;
    const complaintType = formData.get("complaintType") as string;
    const contactPerson = formData.get("contactPerson") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const complaintRemarks = formData.get("complaintRemarks") as string;
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;

    const attachmentFiles = formData.getAll("attachments") as File[];

    if (
      !rawCompany ||
      !softwareType ||
      !complaintType ||
      !contactPerson ||
      !contactPhone ||
      !complaintRemarks ||
      !email
    ) {
      return NextResponse.json(
        {
          error: "All fields are required, including Complaint Type",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------------------------------
    // Phone number validation — must start with "03" and be exactly
    // 11 digits (e.g. 03001234567). Enforced server-side as the
    // authoritative check, in addition to the client-side check in
    // the registration form, so the API can never accept a malformed
    // number even if it's hit directly.
    // ----------------------------------------------------------------
    const normalizedContactPhone = (contactPhone || "").trim();
    if (!/^03\d{9}$/.test(normalizedContactPhone)) {
      return NextResponse.json(
        {
          error:
            "Invalid contact phone number. It must start with '03' and contain exactly 11 digits.",
        },
        { status: 400 },
      );
    }

    if (!(await isValidActiveSoftwareType(softwareType))) {
      return NextResponse.json(
        {
          error: `Invalid software type: "${softwareType}" is not an active software type.`,
        },
        { status: 400 },
      );
    }

    if (!(await isValidActiveComplaintType(complaintType))) {
      return NextResponse.json(
        {
          error: `Invalid complaint type: "${complaintType}" is not an active complaint type.`,
        },
        { status: 400 },
      );
    }

    // ============================
    // Parse company JSON
    // ============================
    let companyObj: any = {};
    try {
      companyObj = JSON.parse(rawCompany);
    } catch {
      return NextResponse.json(
        { error: "Invalid company format" },
        { status: 400 },
      );
    }

    // ============================
    // Generate complaint number
    // ============================
    // A timestamp alone can collide if two complaints are submitted in the
    // same millisecond (concurrent requests). Append a short random suffix
    // so the value stays effectively unique on top of the schema-level
    // `unique: true` constraint, without changing the existing "COMP-..."
    // format that the UI/emails already display.
    const complaintNumber = `COMP-${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    // ============================
    // Handle attachments (GridFS)
    // ============================
    const savedAttachments: any[] = [];

    if (attachmentFiles.length > 0) {
      const gfs = await getGridFS();

      for (const file of attachmentFiles) {
        if (file.size === 0) continue;

        if (!validateFileType(file)) {
          return NextResponse.json(
            {
              error:
                "Invalid file type. Only PDF, WORD, EXCEL, IMAGES allowed.",
            },
            { status: 400 },
          );
        }

        if (!validateFileSize(file)) {
          return NextResponse.json(
            { error: "File size exceeds 10MB" },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            complaintNumber,
            uploadedBy: userId,
            fileSize: file.size,
          },
        });

        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer);
          uploadStream.on("finish", () => {
            savedAttachments.push({
              fileId: uploadStream.id.toString(),
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadedAt: new Date(),
            });
            resolve();
          });
          uploadStream.on("error", reject);
        });
      }
    }

    // ============================
    // Create & save complaint
    // ============================
    const complaintData = {
      complaintNumber,
      company: {
        companyName: companyObj.companyName,
        companyId: companyObj._id || companyObj.companyId,
        city: companyObj.city,
        address: companyObj.address,
        companyRepresentative: companyObj.companyRepresentative,
        phoneNumber: companyObj.phoneNumber,
        support: companyObj.support,
      },

      softwareType,
      complaintType,
      contactPerson,
      contactPhone: normalizedContactPhone,
      complaintRemarks,

      // FIX — use correct field name
      attachments: savedAttachments,

      status: "registered",
      submittedByUserId: userId,
      submitterEmail: (email || "").toLowerCase().trim(),
    };

    // Save with a small retry-on-duplicate safety net: in the extremely
    // rare case the generated complaintNumber still collides with an
    // existing one (unique index violation, error code 11000), generate a
    // fresh number and retry rather than failing the whole submission.
    let savedComplaint;
    {
      let attempt = 0;
      let currentNumber = complaintNumber;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const complaint = new OnlineComplaint({
            ...complaintData,
            complaintNumber: currentNumber,
          });
          savedComplaint = await complaint.save();
          break;
        } catch (saveErr: any) {
          attempt += 1;
          if (saveErr?.code === 11000 && attempt < 3) {
            currentNumber = `COMP-${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
            continue;
          }
          throw saveErr;
        }
      }
    }

    pushComplaintHistory(String(savedComplaint._id), {
      action: "created",
      status: "registered",
      by: contactPerson || email,
      byRole: "customer",
      remarks: complaintRemarks,
    });

    // ============================
    // Email Notification
    // ============================
    if (email) {
      try {
        // Use the number actually persisted on the saved document (in the
        // rare retry-on-duplicate case above it can differ from the
        // originally generated one) so the emailed tracking code always
        // matches what's stored in the database.
        await sendComplaintEmail(
          email,
          savedComplaint.complaintNumber,
          firstName || contactPerson,
        );
      } catch (err) {
        console.error("Complaint confirmation email failed to send:", err);
      }
    }

    // Notification: alert staff who can triage/assign complaints.
    // Awaited (not fire-and-forget) so the notification is guaranteed to be
    // written before the response is returned - serverless functions can be
    // frozen/terminated right after responding, which would otherwise risk
    // silently dropping the notification. notify() already swallows its own
    // errors internally, so this can never fail the complaint submission.
    await notifyComplaintCreated({
      complaintId: String(savedComplaint._id),
      complaintNumber: savedComplaint.complaintNumber,
      companyName: companyObj?.companyName,
      submitterEmail: savedComplaint.submitterEmail,
      submittedAt: savedComplaint.createdAt,
    });

    return NextResponse.json({
      success: true,
      message: "Complaint registered successfully",
      complaintNumber: savedComplaint.complaintNumber,
      attachments: savedAttachments,
    });
  } catch (error: any) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

// ======================================================
// GET → FETCH COMPLAINTS
// ======================================================
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const complaints = await OnlineComplaint.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = complaints.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt?.toISOString(),
      updatedAt: c.updatedAt?.toISOString(),

      // Correct attachment fields
      attachments: c.attachments || [],
      assignmentAttachments: c.assignmentAttachments || [],
      resolutionAttachments: c.resolutionAttachments || [], // Add this line
      developer_attachment: c.developer_attachment || [], // Add this line for compatibility

      assignedTo: c.assignedTo || null,
      assignedDate: c.assignedDate ? c.assignedDate.toISOString() : null,
      expectedCompletionAt: c.expectedCompletionAt
        ? c.expectedCompletionAt.toISOString()
        : null,
      resolvedDate: c.resolvedDate ? c.resolvedDate.toISOString() : null, // Add this line
      resolutionRemarks: c.resolutionRemarks || "", // Add this line
      developerStatus: c.developerStatus || "not-started", // Add this line
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints", details: error.message },
      { status: 500 },
    );
  }
}
