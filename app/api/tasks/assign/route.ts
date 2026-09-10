import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import "@/models/CompanyInformation";
import CompanyInformation from "@/models/CompanyInformation";
import { getGridFS } from "@/lib/gridfs";
import mongoose from "mongoose";
import archiver from "archiver";
import { notifyTaskAssigned } from "@/lib/notification-events";

/**
 * Minimal interfaces
 */
interface CompanyDoc {
  _id?: string;
  softwareInformation?: { softwareType?: string }[];
}

interface TaskDoc {
  _id?: string;
  code?: string;
  company?: { id?: string } | null;
  TasksAttachment?: string[];
  assignmentAttachment?: string[];
  rejectionAttachment?: string[]; // Add this line
  developer_attachment?: string[]; // Add this line
}

/**
 * PUT - assign task and upload files to GridFS
 */
export async function PUT(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();

    const taskId = (formData.get("taskId") as string) || "";
    const userId = (formData.get("userId") as string) || "";
    const username = (formData.get("username") as string) || "";
    const name = (formData.get("name") as string) || "";
    const roleName = (formData.get("roleName") as string) || "";
    const assignedDateRaw = (formData.get("assignedDate") as string) || "";
    const expectedCompletionAtRaw =
      (formData.get("expectedCompletionAt") as string) || "";
    const remarks = (formData.get("remarks") as string) || "";

    if (!taskId || !userId) {
      return NextResponse.json(
        { message: "taskId and userId are required" },
        { status: 400 },
      );
    }

    // Expected Completion Time is required from the shared assignment
    // dialog (see components/tasks/AssignmentDialog.tsx) for both Tasks
    // and Complaints, so an assigned user always has a clear deadline.
    let expectedCompletionAt: Date | undefined;
    if (expectedCompletionAtRaw) {
      const parsed = new Date(expectedCompletionAtRaw);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { message: "Invalid Expected Completion Time" },
          { status: 400 },
        );
      }
      expectedCompletionAt = parsed;
    }

    const files = formData.getAll("files") as File[];

    const task = await Task.findById(taskId).lean<TaskDoc | null>();
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    let softwareType = "N/A";
    if (task.company?.id) {
      try {
        const companyInfo = await CompanyInformation.findById(
          String(task.company.id),
        ).lean<CompanyDoc | null>();
        softwareType =
          companyInfo?.softwareInformation?.[0]?.softwareType ?? "N/A";
      } catch (err) {
        console.warn("Company lookup failed:", err);
      }
    }

    const gfs = await getGridFS();
    const uploadedIds: string[] = [];

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
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "xlsx",
      "xls",
      "doc",
      "docx",
      "txt",
      "csv",
      "json",
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      const name = file.name || `file_${Date.now()}_${i}`;
      const ext = name.split(".").pop()?.toLowerCase() || "";
      const allowedByExt = allowedExts.includes(ext);

      if (!allowedTypes.includes(file.type) && !allowedByExt) {
        console.warn("Blocked file (disallowed type):", name, file.type);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        console.warn("Skipped file (too large):", name, file.size);
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadStream = (gfs as any).openUploadStream
        ? (gfs as any).openUploadStream(name, {
            contentType: file.type || undefined,
            metadata: {
              originalName: name,
              uploadedAt: new Date(),
              uploadedBy: userId,
              relatedTask: taskId,
            },
          })
        : null;

      if (!uploadStream) {
        throw new Error("GridFS upload not available");
      }

      await new Promise<void>((resolve, reject) => {
        uploadStream.end(buffer);
        uploadStream.on("finish", () => resolve());
        uploadStream.on("error", (err: any) => reject(err));
      });

      uploadedIds.push(String(uploadStream.id));
    }

    const updateData: any = {
      assigned: true,
      approved: true,
      assignedTo: {
        id: userId,
        username,
        name,
        role: { name: roleName },
      },
      assignedDate: assignedDateRaw ? new Date(assignedDateRaw) : new Date(),
      assignmentRemarks: remarks || "",
      assignmentAttachment: uploadedIds,
      status: "assigned",
      approvedAt: new Date(),
      softwareType,
    };

    if (expectedCompletionAt) {
      updateData.expectedCompletionAt = expectedCompletionAt;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    // Notification: alert the assignee (non-blocking)
    notifyTaskAssigned({
      taskId,
      taskCode: (task as TaskDoc)?.code || taskId,
      assignedToUserId: userId,
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Error assigning task:", error);
    return NextResponse.json(
      {
        message: "Failed to assign task",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * GET - Download individual files or ZIP archive
 */
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    const fileId = searchParams.get("fileId");
    const download = searchParams.get("download");
    const type = searchParams.get("type"); // Get the type parameter

    // If fileId is provided, download that single file
    if (fileId) {
      return await downloadSingleFile(fileId);
    }

    // If download=zip is provided, create ZIP archive
    if (taskId && download === "zip") {
      // Pass the type parameter to downloadAsZip
      return await downloadAsZip(taskId, type);
    }

    // If only taskId is provided, return file list
    if (taskId) {
      // Pass the type parameter to getFileList
      return await getFileList(taskId, type);
    }

    return NextResponse.json(
      { message: "taskId or fileId is required" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Error handling file download:", error);
    return NextResponse.json(
      {
        message: "Failed to handle file download",
        error: error?.message ?? String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Download a single file by GridFS ID
 */
async function downloadSingleFile(fileId: string) {
  try {
    const gfs = await getGridFS();

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ message: "Invalid file ID" }, { status: 400 });
    }

    const objId = new mongoose.Types.ObjectId(fileId);
    let fileDoc: any = null;

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("No mongoose DB connection available");
    }

    try {
      if (typeof (gfs as any).find === "function") {
        const files = await (gfs as any).find({ _id: objId }).toArray();
        fileDoc = files && files.length > 0 ? files[0] : null;
      } else {
        const files = await db
          .collection("fs.files")
          .find({ _id: objId })
          .toArray();
        fileDoc = files && files.length > 0 ? files[0] : null;
      }
    } catch (err) {
      console.warn("Failed to lookup GridFS metadata:", err);
    }

    if (!fileDoc) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const downloadStream = (gfs as any).openDownloadStream
      ? (gfs as any).openDownloadStream(objId)
      : null;

    if (!downloadStream) {
      return NextResponse.json(
        { message: "File stream not available" },
        { status: 500 },
      );
    }

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on("end", () => resolve());
      downloadStream.on("error", (err: any) => reject(err));
    });

    const fileBuffer = Buffer.concat(chunks);
    const fileName = fileDoc.filename || `file-${fileId}`;

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": fileDoc.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading single file:", error);
    return NextResponse.json(
      { message: "Failed to download file" },
      { status: 500 },
    );
  }
}

/**
 * Download all attachments as ZIP
 */
async function downloadAsZip(taskId: string, type: string | null = null) {
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ message: "Invalid taskId" }, { status: 400 });
    }

    const task = await Task.findById(taskId).lean<TaskDoc | null>();
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    let allAttachments: string[] = [];

    // Determine which attachments to include based on type
    switch (type) {
      case "assignment":
        allAttachments = task.assignmentAttachment ?? [];
        break;
      case "rejection":
        allAttachments = task.rejectionAttachment ?? []; // Add this case
        break;
      case "developer":
        allAttachments = task.developer_attachment ?? []; // Add this case
        break;
      case "task":
      default:
        allAttachments = task.TasksAttachment ?? [];
        break;
    }

    // Filter to valid ObjectIds
    allAttachments = allAttachments.filter((attachment) =>
      /^[0-9a-fA-F]{24}$/.test(attachment),
    );

    if (allAttachments.length === 0) {
      return NextResponse.json(
        {
          message: `No ${type || "task"} attachments available`,
          type: type || "task",
        },
        { status: 404 },
      );
    }

    const gfs = await getGridFS();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("No database connection");
    }

    // Create a pass-through stream for the ZIP
    const { PassThrough } = await import("stream");
    const passThrough = new PassThrough();

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    archive.pipe(passThrough);

    // Add each file to the ZIP
    for (const attachmentId of allAttachments) {
      try {
        const objId = new mongoose.Types.ObjectId(attachmentId);
        let fileDoc: any = null;

        if (typeof (gfs as any).find === "function") {
          const files = await (gfs as any).find({ _id: objId }).toArray();
          fileDoc = files && files.length > 0 ? files[0] : null;
        } else {
          const files = await db
            .collection("fs.files")
            .find({ _id: objId })
            .toArray();
          fileDoc = files && files.length > 0 ? files[0] : null;
        }

        if (!fileDoc) continue;

        const downloadStream = (gfs as any).openDownloadStream
          ? (gfs as any).openDownloadStream(objId)
          : null;

        if (downloadStream) {
          const chunks: Buffer[] = [];
          await new Promise<void>((resolve, reject) => {
            downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
            downloadStream.on("end", () => resolve());
            downloadStream.on("error", (err: any) => reject(err));
          });

          const fileBuffer = Buffer.concat(chunks);
          const fileName = fileDoc.filename || `file-${attachmentId}`;

          archive.append(fileBuffer, { name: fileName });
        }
      } catch (fileError) {
        console.error(`Error processing file ${attachmentId}:`, fileError);
        continue;
      }
    }

    await archive.finalize();

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of passThrough) {
      chunks.push(chunk);
    }
    const zipBuffer = Buffer.concat(chunks);

    // Set the filename based on type
    const filename = `${type || "task"}-attachments-${taskId}.zip`;

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error creating ZIP archive:", error);
    return NextResponse.json(
      { message: "Failed to create ZIP archive" },
      { status: 500 },
    );
  }
}

/**
 * Get list of files for a task
 */
async function getFileList(taskId: string, type: string | null = null) {
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ message: "Invalid taskId" }, { status: 400 });
    }

    const task = await Task.findById(taskId).lean<TaskDoc | null>();
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Get the appropriate attachment array based on type
    let attachmentArray: string[] = [];
    switch (type) {
      case "assignment":
        attachmentArray = task.assignmentAttachment ?? [];
        break;
      case "rejection":
        attachmentArray = task.rejectionAttachment ?? [];
        break;
      case "developer":
        attachmentArray = task.developer_attachment ?? [];
        break;
      case "task":
      default:
        attachmentArray = task.TasksAttachment ?? [];
        break;
    }

    if (attachmentArray.length === 0) {
      return NextResponse.json({
        message: `No ${type || "task"} attachments available`,
        files: [],
        type: type || "task",
      });
    }

    const files = attachmentArray.map((attachment, index) => {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(attachment);
      return {
        id: attachment,
        name: `file-${index + 1}`,
        downloadUrl: isValidObjectId
          ? `/api/tasks/assign?taskId=${taskId}&fileId=${attachment}`
          : attachment,
        isValidObjectId,
      };
    });

    return NextResponse.json({
      message: "Files retrieved successfully",
      taskCode: task.code,
      files: files,
      type: type || "task",
    });
  } catch (error: any) {
    console.error("Error getting file list:", error);
    return NextResponse.json(
      { message: "Failed to get file list" },
      { status: 500 },
    );
  }
}
