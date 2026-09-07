import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import OnlineComplaint from "@/models/OnlineComplaint";
import User from "@/models/User";
import { verifySessionCookie } from "@/lib/auth";
import { pushComplaintHistory } from "@/lib/complaint-history";
import { notifyComplaintRejected } from "@/lib/notification-events";
import { sendComplaintRejectionEmail } from "@/lib/email-service";

// ======================================================
// PUT → REJECT AN ONLINE COMPLAINT
//
// Used by the "Task & Complaint Assignment" admin screen as the
// counterpart to /api/online-complaints/assign. Rejects a complaint
// that is invalid/incomplete instead of assigning it. Mandatory
// remarks explain the reason to the customer. The complaint status is
// updated to "rejected" and an email is sent to the exact email
// address the complaint was submitted with (never hardcoded).
// ======================================================
export async function PUT(req: NextRequest) {
  console.log("=== REJECT COMPLAINT API ===");

  await dbConnect();

  // Identify the acting Administrator dynamically from their session —
  // never trust a client-supplied name for who performed the action.
  let adminId: string;
  let adminUsername: string;
  try {
    const decoded = await verifySessionCookie(req);
    adminId = decoded.sub;
    adminUsername = decoded.username;
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const complaintId = (body?.complaintId as string) || "";
    const remarks = ((body?.remarks as string) || "").trim();

    if (!complaintId) {
      return NextResponse.json(
        { message: "complaintId is required" },
        { status: 400 },
      );
    }

    // Mandatory remarks — the Administrator must explain why the
    // complaint is being rejected so the customer knows what to fix.
    if (!remarks) {
      return NextResponse.json(
        { message: "Rejection remarks/reason are required" },
        { status: 400 },
      );
    }

    const query = mongoose.Types.ObjectId.isValid(complaintId)
      ? { _id: complaintId }
      : { complaintNumber: complaintId };

    const complaint = await OnlineComplaint.findOne(query).lean();
    if (!complaint) {
      return NextResponse.json(
        { message: "Complaint not found", query, complaintId },
        { status: 404 },
      );
    }

    // Only a newly registered (not yet assigned/actioned) complaint can
    // be rejected from the assignment queue — once it's in progress,
    // resolved, closed, or already rejected, this action no longer
    // applies.
    if (complaint.status !== "registered") {
      return NextResponse.json(
        {
          message: `This complaint has already been ${complaint.status} and can no longer be rejected from here.`,
        },
        { status: 400 },
      );
    }

    const adminUser = await User.findById(adminId).select("name username").lean();
    const adminName =
      (adminUser && !Array.isArray(adminUser) && adminUser.name) || adminUsername;

    const updateData = {
      status: "rejected",
      adminRejectionRemarks: remarks,
      rejectedBy: {
        id: adminId,
        username: adminUsername,
        name: adminName,
      },
      rejectedDate: new Date(),
      updatedBy: adminId,
    };

    const updatedComplaint = await OnlineComplaint.findOneAndUpdate(
      { _id: complaint._id },
      { $set: updateData },
      { new: true, runValidators: true, lean: true },
    );

    if (!updatedComplaint) {
      return NextResponse.json(
        { message: "Failed to update complaint in database" },
        { status: 500 },
      );
    }

    pushComplaintHistory(String(updatedComplaint._id), {
      action: "admin_rejected",
      status: "rejected",
      by: adminName,
      byRole: "admin",
      remarks,
    });

    // Email the exact submitter address stored on the complaint — never
    // a hardcoded/static address.
    if (updatedComplaint.submitterEmail) {
      try {
        await sendComplaintRejectionEmail(
          updatedComplaint.submitterEmail,
          updatedComplaint.complaintNumber,
          updatedComplaint.contactPerson,
          remarks,
        );
      } catch (emailError) {
        console.error("Complaint rejection email failed to send:", emailError);
      }
    }

    // In-app notification for staff/managers tracking complaints.
    await notifyComplaintRejected({
      complaintId: String(updatedComplaint._id),
      complaintNumber: updatedComplaint.complaintNumber,
      actor: { id: adminId, name: adminName, username: adminUsername },
    });

    return NextResponse.json({
      success: true,
      message: "Complaint rejected successfully",
      complaint: {
        ...updatedComplaint,
        rejectedDate: updatedComplaint.rejectedDate
          ? updatedComplaint.rejectedDate.toISOString()
          : null,
        updatedAt: updatedComplaint.updatedAt
          ? updatedComplaint.updatedAt.toISOString()
          : null,
      },
    });
  } catch (error: any) {
    console.error("❌ Error rejecting complaint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reject complaint",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
