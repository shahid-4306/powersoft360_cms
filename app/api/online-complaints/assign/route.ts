import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint";
import { getGridFS } from "@/lib/gridfs";
import mongoose from "mongoose";
import { notifyComplaintAssigned } from "@/lib/notification-events";
import { pushComplaintHistory } from "@/lib/complaint-history";

export async function PUT(req: Request) {
  console.log('=== ASSIGN COMPLAINT API ===');
  
  await dbConnect();

  try {
    const formData = await req.formData();

    const complaintId = (formData.get("complaintId") as string) || "";
    const userId = (formData.get("userId") as string) || "";
    const username = (formData.get("username") as string) || "";
    const name = (formData.get("name") as string) || "";
    const roleName = (formData.get("roleName") as string) || "";
    const assignedDateRaw = (formData.get("assignedDate") as string) || "";
    const remarks = (formData.get("remarks") as string) || "";

    console.log('Received form data:', {
      complaintId,
      userId,
      username,
      name,
      roleName,
      assignedDateRaw,
      remarks,
      filesCount: formData.getAll("files").length
    });

    if (!complaintId || !userId) {
      return NextResponse.json({ 
        message: "complaintId and userId are required",
        received: { complaintId, userId }
      }, { status: 400 });
    }

    // Build query to find complaint by either _id or complaintNumber
    const query = mongoose.Types.ObjectId.isValid(complaintId) 
      ? { _id: complaintId }
      : { complaintNumber: complaintId };

    console.log('Searching complaint with query:', query);

    const complaint = await OnlineComplaint.findOne(query).lean();
    if (!complaint) {
      console.log('Complaint not found with query:', query);
      return NextResponse.json({ 
        message: "Complaint not found",
        query,
        complaintId
      }, { status: 404 });
    }

    console.log('✅ Complaint found:', {
      _id: complaint._id,
      complaintNumber: complaint.complaintNumber,
      status: complaint.status
    });

    const gfs = await getGridFS();
    const uploadedAttachments: any[] = [];

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/json",
    ];

    const allowedExts = [
      "pdf", "jpg", "jpeg", "png", "gif", 
      "xlsx", "xls", "doc", "docx",
      "txt", "csv", "json"
    ];

    const files = formData.getAll("files") as File[];
    console.log(`Processing ${files.length} uploaded files...`);

    // Process uploaded files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      const originalName = file.name || `file_${Date.now()}_${i}`;
      const ext = originalName.split(".").pop()?.toLowerCase() || "";
      const allowedByExt = allowedExts.includes(ext);

      if (!allowedTypes.includes(file.type) && !allowedByExt) {
        console.warn(`Skipped file: ${originalName} - disallowed type: ${file.type}`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        console.warn(`Skipped file: ${originalName} - too large: ${file.size} bytes`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log(`Uploading file ${i + 1}/${files.length}: ${originalName} (${file.size} bytes)`);

        // Create upload stream
        let uploadStream: any = null;
        
        if ((gfs as any).openUploadStream) {
          uploadStream = (gfs as any).openUploadStream(originalName, {
            contentType: file.type || undefined,
            metadata: {
              originalName: originalName,
              uploadedAt: new Date(),
              uploadedBy: userId,
              relatedComplaint: complaint._id || complaint.complaintNumber,
              purpose: 'assignment-attachment'
            },
          });
        }

        if (!uploadStream) {
          console.error('GridFS upload stream not available');
          continue;
        }

        // Upload file
        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer);
          uploadStream.on("finish", () => {
            console.log(`✅ File uploaded successfully: ${originalName} (ID: ${uploadStream.id})`);
            resolve();
          });
          uploadStream.on("error", (err: any) => {
            console.error(`❌ Error uploading file ${originalName}:`, err);
            reject(err);
          });
        });

        // Create attachment record
        uploadedAttachments.push({
          fileId: String(uploadStream.id),
          fileName: originalName,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          uploadedAt: new Date(),
          uploadedBy: userId,
          purpose: 'assignment'
        });

      } catch (fileError) {
        console.error(`Error processing file ${originalName}:`, fileError);
        // Continue with other files even if one fails
      }
    }

    console.log(`Successfully uploaded ${uploadedAttachments.length} files`);

    // Parse assigned date
    let assignedDate: Date;
    if (assignedDateRaw) {
      assignedDate = new Date(assignedDateRaw);
      if (isNaN(assignedDate.getTime())) {
        console.warn('Invalid assigned date, using current date');
        assignedDate = new Date();
      }
    } else {
      assignedDate = new Date();
    }

    // Prepare comprehensive update data
    const updateData: any = {
      status: "in-progress",
      assignedTo: {
        id: userId,
        username: username,
        name: name,
        role: { 
          name: roleName 
        },
      },
      assignedDate: assignedDate,
      assignmentRemarks: remarks || "",
    };

    // Only add assignmentAttachments if we have any
    if (uploadedAttachments.length > 0) {
      updateData.assignmentAttachments = uploadedAttachments;
    }

    // Add updatedBy field (optional)
    updateData.updatedBy = userId;

    console.log('Updating complaint with data:', {
      complaintId: complaint._id,
      updateData: {
        ...updateData,
        assignedDate: assignedDate.toISOString(),
        assignmentAttachmentsCount: uploadedAttachments.length
      }
    });

    // Use findOneAndUpdate with the correct query (using _id from found complaint)
    const updatedComplaint = await OnlineComplaint.findOneAndUpdate(
      { _id: complaint._id },
      { $set: updateData }, 
      { 
        new: true, 
        runValidators: true,
        lean: true 
      }
    );

    if (!updatedComplaint) {
      console.error('Failed to update complaint after findOneAndUpdate');
      return NextResponse.json({ 
        message: "Failed to update complaint in database",
        complaintId: complaint._id
      }, { status: 500 });
    }

    console.log('✅ Complaint assigned successfully:', {
      complaintNumber: updatedComplaint.complaintNumber,
      status: updatedComplaint.status,
      assignedTo: updatedComplaint.assignedTo,
      assignedDate: updatedComplaint.assignedDate,
      assignmentRemarks: updatedComplaint.assignmentRemarks,
      assignmentAttachmentsCount: updatedComplaint.assignmentAttachments?.length || 0,
      updatedAt: updatedComplaint.updatedAt
    });

    pushComplaintHistory(String(updatedComplaint._id), {
      action: "assigned",
      status: "in-progress",
      by: name || username,
      byRole: "admin",
      remarks: remarks || `Assigned to ${name || username}`,
    });

    // Notification: alert the assigned staff member (non-blocking)
    await notifyComplaintAssigned({
      complaintId: String(complaint._id),
      complaintNumber: updatedComplaint.complaintNumber,
      assignedToUserId: userId,
    });

    return NextResponse.json({
      success: true,
      message: "Complaint assigned successfully",
      complaint: {
        ...updatedComplaint,
        assignedDate: updatedComplaint.assignedDate ? updatedComplaint.assignedDate.toISOString() : null,
        updatedAt: updatedComplaint.updatedAt ? updatedComplaint.updatedAt.toISOString() : null
      }
    });

  } catch (error: any) {
    console.error("❌ Error assigning complaint:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json({ 
      success: false,
      message: "Failed to assign complaint", 
      error: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}