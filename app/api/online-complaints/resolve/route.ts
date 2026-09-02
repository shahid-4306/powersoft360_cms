// app/api/online-complaints/resolve/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";           // your DB connect util
import OnlineComplaint from "@/models/OnlineComplaint";
import { getGridFS } from "@/lib/gridfs";  // should return GridFSBucket or object with openUploadStream
import { notifyComplaintResolved } from "@/lib/notification-events";
import { pushComplaintHistory } from "@/lib/complaint-history";

export async function PUT(req: Request) {
  console.log("=== RESOLVE COMPLAINT API ===");
  await dbConnect();

  try {
    const formData = await req.formData();

    const complaintId = (formData.get("complaintId") as string) || "";
    const resolutionRemarks = ((formData.get("resolutionRemarks") as string) || "").trim();
    const resolutionFiles = formData.getAll("resolutionAttachments") as File[] || [];
    const developerUsername = (formData.get("developerUsername") as string) || "";
    const developerName = (formData.get("developerName") as string) || "";
    const developerRole = (formData.get("developerRole") as string) || "";

    console.log("Received form data:", {
      complaintId,
      resolutionRemarksLength: resolutionRemarks.length,
      resolutionFilesCount: resolutionFiles.length,
      developerUsername,
      developerName,
      developerRole
    });

    if (!complaintId || !resolutionRemarks) {
      return NextResponse.json({
        message: "complaintId and resolutionRemarks are required",
        received: {
          complaintId: !!complaintId,
          resolutionRemarks: !!resolutionRemarks,
          resolutionRemarksLength: resolutionRemarks.length
        }
      }, { status: 400 });
    }

    // Build query to accept either _id or complaintNumber
    const query = mongoose.Types.ObjectId.isValid(complaintId)
      ? { _id: new mongoose.Types.ObjectId(complaintId) }
      : { complaintNumber: complaintId };

    console.log("Searching complaint with query:", query);
    const complaint = await OnlineComplaint.findOne(query).exec();

    if (!complaint) {
      console.log("Complaint not found with query:", query);
      return NextResponse.json({ message: "Complaint not found", query, complaintId }, { status: 404 });
    }

    console.log("✅ Complaint found:", {
      _id: complaint._id?.toString(),
      complaintNumber: complaint.complaintNumber,
      status: complaint.status,
      assignedTo: complaint.assignedTo
    });

    // Only allow resolving when in-progress
    if (complaint.status !== "in-progress") {
      return NextResponse.json({
        message: "Complaint is not in progress. Current status: " + complaint.status,
        currentStatus: complaint.status
      }, { status: 400 });
    }

    // Authorization: allow if admin/manager or assigned user
    const isAdminOrManager =
      developerRole?.toLowerCase().includes("admin") ||
      developerRole?.toLowerCase().includes("manager");

    if (!isAdminOrManager && complaint.assignedTo?.username !== developerUsername) {
      console.log("User not authorized to resolve this complaint:", {
        assignedToUsername: complaint.assignedTo?.username,
        developerUsername,
        developerRole
      });
      return NextResponse.json({
        message: "You are not authorized to resolve this complaint. It is assigned to another developer.",
        assignedTo: complaint.assignedTo?.username,
        yourUsername: developerUsername
      }, { status: 403 });
    }

    // Prepare GridFS
    const gfs = await getGridFS();
    const uploadedAttachments: Array<{
      fileId: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      uploadedAt: Date;
      uploadedBy: string;
    }> = [];

    const allowedTypes = new Set([
      "application/pdf",
      "image/jpeg", "image/jpg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/json"
    ]);

    const allowedExts = new Set([
      "pdf", "jpg", "jpeg", "png", "gif",
      "xlsx", "xls", "doc", "docx",
      "txt", "csv", "json"
    ]);

    console.log(`Processing ${resolutionFiles.length} resolution files...`);

    for (let i = 0; i < resolutionFiles.length; i++) {
      const file = resolutionFiles[i];
      if (!file || file.size === 0) continue;

      const originalName = file.name || `resolution_${Date.now()}_${i}`;
      const ext = (originalName.split(".").pop() || "").toLowerCase();
      const allowedByExt = allowedExts.has(ext);
      const allowedByType = allowedTypes.has(file.type);

      if (!allowedByType && !allowedByExt) {
        console.warn(`Skipped resolution file: ${originalName} - disallowed type: ${file.type}`);
        continue;
      }

      // 10 MB limit
      const MAX_BYTES = 10 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        console.warn(`Skipped resolution file: ${originalName} - too large: ${file.size} bytes`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log(`Uploading resolution file ${i + 1}/${resolutionFiles.length}: ${originalName} (${file.size} bytes)`);

        // Support both GridFSBucket.openUploadStream (typical) or a custom wrapper
        let uploadId: any = null;

        if (gfs && typeof (gfs as any).openUploadStream === "function") {
          // GridFSBucket or similar
          const uploadStream = (gfs as any).openUploadStream(originalName, {
            contentType: file.type || undefined,
            metadata: {
              originalName,
              uploadedAt: new Date(),
              uploadedBy: developerUsername,
              developerName,
              relatedComplaint: complaint._id?.toString?.() || complaint.complaintNumber,
              purpose: "resolution-attachment"
            }
          });

          // write buffer and wait for finish
          await new Promise<void>((resolve, reject) => {
            uploadStream.end(buffer);
            uploadStream.on("finish", () => {
              uploadId = uploadStream.id;
              console.log(`✅ Resolution file uploaded successfully: ${originalName} (ID: ${uploadId})`);
              resolve();
            });
            uploadStream.on("error", (err: any) => {
              console.error(`❌ Error uploading resolution file ${originalName}:`, err);
              reject(err);
            });
          });
        } else if (gfs && typeof (gfs as any).uploadFromStream === "function") {
          // If getGridFS returned a helper with uploadFromStream
          uploadId = await (gfs as any).uploadFromStream(originalName, buffer, {
            contentType: file.type || undefined,
            metadata: { uploadedBy: developerUsername, purpose: "resolution-attachment" }
          });
          console.log(`✅ Resolution file uploaded via helper: ${originalName} (ID: ${uploadId})`);
        } else {
          console.error("GridFS upload API not available. Skipping upload for file:", originalName);
          continue;
        }

        uploadedAttachments.push({
          fileId: String(uploadId),
          fileName: originalName,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
          uploadedAt: new Date(),
          uploadedBy: developerUsername || developerName || "unknown"
        });

      } catch (fileError) {
        console.error(`Error processing resolution file ${originalName}:`, fileError);
        // continue to next file
      }
    }

    console.log(`Successfully uploaded ${uploadedAttachments.length} resolution files`);
    if (uploadedAttachments.length > 0) {
      console.log("Uploaded attachments structure:", JSON.stringify(uploadedAttachments, null, 2));
    }

    // Build update operations
    const updateOperations: any = {
      $set: {
        status: "resolved",
        resolvedDate: new Date(),
        resolutionRemarks,
        developerStatus: "done",
        developer_status: "done",
        // developer_remarks: resolutionRemarks,
        developer_done_date: new Date(),
        updatedAt: new Date()
      }
    };

    if (uploadedAttachments.length > 0) {
      updateOperations.$push = {
        resolutionAttachments: { $each: uploadedAttachments },
        // developer_attachment: {
        //   $each: uploadedAttachments.map(att => ({
        //     ...att,
        //     purpose: "resolution"
        //   }))
        // }
      };
    }

    console.log("Update operations:", JSON.stringify(updateOperations, null, 2));

    // IMPORTANT: return the updated document
    const updatedComplaint = await OnlineComplaint.findOneAndUpdate(
      { _id: complaint._id },
      updateOperations,
      { new: true, runValidators: true } // new:true returns updated doc
    ).exec();

    if (!updatedComplaint) {
      console.error("Failed to update complaint after findOneAndUpdate");
      return NextResponse.json({
        message: "Failed to update complaint in database",
        complaintId: complaint._id?.toString?.()
      }, { status: 500 });
    }

    // Prepare JSON-safe response (convert dates to ISO)
    const resp = {
      complaintNumber: updatedComplaint.complaintNumber,
      status: updatedComplaint.status,
      resolvedDate: updatedComplaint.resolvedDate ? updatedComplaint.resolvedDate.toISOString() : null,
      resolutionRemarks: updatedComplaint.resolutionRemarks,
      resolutionAttachmentsCount: (updatedComplaint as any).resolutionAttachments?.length || 0,
      resolutionAttachments: (updatedComplaint as any).resolutionAttachments || [],
      developerStatus: updatedComplaint.developerStatus,
      developer_attachment_count: (updatedComplaint as any).developer_attachment?.length || 0,
      updatedAt: updatedComplaint.updatedAt ? updatedComplaint.updatedAt.toISOString() : null
    };

    console.log("✅ Complaint resolved successfully:", resp);

    pushComplaintHistory(String(complaint._id), {
      action: "resolved",
      status: "resolved",
      by: developerName || developerUsername,
      byRole: "developer",
      remarks: resolutionRemarks,
    });

    // Notification: alert managers/admins that the complaint was resolved (non-blocking)
    await notifyComplaintResolved({
      complaintId: String(complaint._id),
      complaintNumber: updatedComplaint.complaintNumber,
      actor: { username: developerUsername, name: developerName },
    });

    return NextResponse.json({
      success: true,
      message: "Complaint resolved successfully",
      complaint: resp
    });

  } catch (error: any) {
    console.error("❌ Error resolving complaint:", error);
    console.error("Error stack:", error?.stack);

    return NextResponse.json({
      success: false,
      message: "Failed to resolve complaint",
      error: error?.message || String(error)
    }, { status: 500 });
  }
}
