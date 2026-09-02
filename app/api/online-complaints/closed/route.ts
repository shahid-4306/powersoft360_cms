import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint"
import { verifySessionCookie } from "@/lib/auth"
import { pushComplaintHistory } from "@/lib/complaint-history"

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    let userId: string
    try {
      const session = await verifySessionCookie(request)
      userId = session.username
    } catch (error: any) {
      return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 })
    }

    // First check if request has form data
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      // Fallback to JSON if not form data
      const body = await request.json()
      const { complaintId, finalStatus, completionRemarks, rejectionRemarks } = body

      console.log("Processing complaint closure (JSON):", { complaintId, finalStatus })

      if (!complaintId || !finalStatus) {
        return NextResponse.json(
          { error: "Complaint ID and status are required" },
          { status: 400 }
        )
      }

      const complaint = await OnlineComplaint.findById(complaintId)
      if (!complaint) {
        return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
      }

      const updateData: any = {
        status: finalStatus === "done" ? "closed" : "in-progress",
        updatedBy: userId,
        updatedAt: new Date()
      }

      if (finalStatus === "done") {
        updateData.completionRemarks = completionRemarks || "Completed"
        updateData.completionApproved = true
        updateData.completionApprovedAt = new Date()
      } else if (finalStatus === "rejected") {
        updateData.completionRejectionRemarks = rejectionRemarks || "Rejected"
        updateData.status = "in-progress"
        updateData.developerStatus = "pending"
      }

      const updatedComplaint = await OnlineComplaint.findByIdAndUpdate(
        complaintId,
        updateData,
        { new: true }
      )

      pushComplaintHistory(complaintId, {
        action: finalStatus === "rejected" ? "admin_rejected" : "admin_closed",
        status: updateData.status,
        by: userId,
        byRole: "admin",
        remarks: finalStatus === "rejected" ? rejectionRemarks : completionRemarks,
      })

      return NextResponse.json({
        success: true,
        message: `Complaint ${finalStatus === "rejected" ? "rejected" : "closed"} successfully`,
        complaint: updatedComplaint
      })
    }

    // Handle form data with file uploads
    const formData = await request.formData()
    const complaintId = formData.get("complaintId") as string
    const finalStatus = formData.get("finalStatus") as string
    const completionRemarks = formData.get("completionRemarks") as string
    const rejectionRemarks = formData.get("rejectionRemarks") as string

    console.log("Processing complaint closure (FormData):", {
      complaintId,
      finalStatus,
      hasCompletionRemarks: !!completionRemarks,
      hasRejectionRemarks: !!rejectionRemarks
    })

    if (!complaintId || !finalStatus) {
      return NextResponse.json(
        { error: "Complaint ID and status are required" },
        { status: 400 }
      )
    }

    const complaint = await OnlineComplaint.findById(complaintId)
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    console.log("Found complaint:", {
      id: complaint._id,
      currentStatus: complaint.status,
      developerStatus: complaint.developerStatus
    })

    // Update complaint based on status
    const updateData: any = {
      status: finalStatus === "done" ? "closed" : finalStatus,
      updatedBy: userId,
      updatedAt: new Date()
    }

    if (finalStatus === "done") {
      updateData.completionRemarks = completionRemarks || "No remarks provided"
      updateData.completionApproved = true
      updateData.completionApprovedAt = new Date()
    } else if (finalStatus === "rejected") {
      updateData.completionRejectionRemarks = rejectionRemarks || "No rejection remarks provided"
      updateData.status = "in-progress"
      updateData.developerStatus = "pending"
    }

    // Handle file uploads - FIXED: Get ALL files with the same field name
    const completionAttachments: File[] = []
    const rejectionAttachments: File[] = []
    
    // Get all entries from form data
    for (const [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key} = ${value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value}`)
      
      if (value instanceof File) {
        if (key === "completionAttachment") {
          completionAttachments.push(value)
        } else if (key === "rejectionAttachment") {
          rejectionAttachments.push(value)
        }
      }
    }

    console.log(`Files found: ${completionAttachments.length} completion, ${rejectionAttachments.length} rejection`)

    const filesToUpload = finalStatus === "rejected" ? rejectionAttachments : completionAttachments
    
    if (filesToUpload.length > 0) {
      console.log(`Processing ${filesToUpload.length} files for upload`)
      
      const attachments: any[] = []
      
      for (const file of filesToUpload) {
        try {
          console.log(`Processing file: ${file.name} (${file.size} bytes, ${file.type})`)
          
          // Convert file to base64
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64String = `data:${file.type};base64,${buffer.toString("base64")}`
          
          console.log(`File converted to base64, size: ${base64String.length} chars`)
          
          // Upload to Cloudinary if configured
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            console.log("Uploading to Cloudinary...")
            
            const cloudinaryResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
              {
                method: "POST",
                body: JSON.stringify({
                  file: base64String,
                  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
                  folder: "complaints"
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              }
            )

            if (cloudinaryResponse.ok) {
              const cloudinaryData = await cloudinaryResponse.json()
              console.log(`Cloudinary upload successful: ${cloudinaryData.public_id}`)
              
              attachments.push({
                fileId: cloudinaryData.public_id,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadedAt: new Date(),
                uploadedBy: userId,
                purpose: finalStatus === "rejected" ? "rejection" : "completion"
              })
            } else {
              console.error("Cloudinary upload failed:", await cloudinaryResponse.text())
              // Fallback: Save without Cloudinary
              attachments.push({
                fileId: `local-${Date.now()}-${file.name}`,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadedAt: new Date(),
                uploadedBy: userId,
                purpose: finalStatus === "rejected" ? "rejection" : "completion"
              })
            }
          } else {
            console.log("Cloudinary not configured, saving file metadata only")
            // Save file metadata without Cloudinary upload
            attachments.push({
              fileId: `local-${Date.now()}-${file.name}`,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadedAt: new Date(),
              uploadedBy: userId,
              purpose: finalStatus === "rejected" ? "rejection" : "completion"
            })
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError)
          // Continue with other files even if one fails
        }
      }

      if (attachments.length > 0) {
        if (finalStatus === "rejected") {
          updateData.completionRejectionAttachment = attachments
          console.log(`Saved ${attachments.length} rejection attachments`)
        } else {
          updateData.completionAttachment = attachments
          console.log(`Saved ${attachments.length} completion attachments`)
        }
      }
    }

    console.log("Final update data:", JSON.stringify(updateData, null, 2))

    const updatedComplaint = await OnlineComplaint.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true }
    )

    if (!updatedComplaint) {
      throw new Error("Failed to update complaint")
    }

    pushComplaintHistory(complaintId, {
      action: finalStatus === "rejected" ? "admin_rejected" : "admin_closed",
      status: updateData.status,
      by: userId,
      byRole: "admin",
      remarks: finalStatus === "rejected" ? rejectionRemarks : completionRemarks,
    })

    console.log("Successfully updated complaint:", {
      id: updatedComplaint._id,
      status: updatedComplaint.status,
      completionApproved: updatedComplaint.completionApproved,
      completionRemarks: updatedComplaint.completionRemarks,
      completionAttachment: updatedComplaint.completionAttachment?.length || 0,
      completionRejectionAttachment: updatedComplaint.completionRejectionAttachment?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: `Complaint ${finalStatus === "rejected" ? "rejected" : "closed"} successfully`,
      complaint: updatedComplaint
    })
  } catch (error: any) {
    console.error("Error closing complaint:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to close complaint",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}