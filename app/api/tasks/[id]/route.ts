// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import Task from "@/models/Task";
// import { getGridFS } from "@/lib/gridfs";
// import { validateFileType, validateFileSize } from "@/lib/downloadUtils";
// import { sseManager } from "@/lib/sse";
// import mongoose from "mongoose";
// import { isValidActiveSoftwareType } from "@/lib/softwareTypes";

// // Connect to database once
// const connectDB = dbConnect();

// interface Params {
//   params: {
//     id: string;
//   };
// }

// // Software types are now managed dynamically by Administrators from
// // Dashboard → Software Types (see models/SoftwareType.ts and
// // lib/softwareTypes.ts) instead of this hardcoded list.

// export async function GET(request: Request, { params }: Params) {
//   await connectDB;
//   try {
//     const { id } = await params;

//     const task = await Task.findById(id).lean().exec();

//     if (!task) {
//       return NextResponse.json({ error: "Task not found" }, { status: 404 });
//     }

//     return NextResponse.json(task);
//   } catch (error: any) {
//     console.error("Error fetching task:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch task" },
//       { status: 500 },
//     );
//   }
// }

// export async function PUT(request: Request, { params }: Params) {
//   await connectDB;
//   try {
//     const { id } = await params;
//     const contentType = request.headers.get("content-type") || "";

//     if (!contentType.includes("multipart/form-data")) {
//       return NextResponse.json(
//         { error: "Content-Type must be multipart/form-data" },
//         { status: 400 },
//       );
//     }

//     const formData = await request.formData();

//     console.log(
//       "Received form data fields for task update:",
//       Array.from(formData.entries()),
//     );

//     // Determine update type
//     const completionApproved = formData.get("completionApproved");
//     const finalStatus = formData.get("finalStatus");

//     const isCompletionUpdate = completionApproved === "true" && finalStatus;

//     console.log("Update type detection:", {
//       completionApproved,
//       finalStatus,
//       isCompletionUpdate,
//     });

//     if (isCompletionUpdate) {
//       return handleCompletionUpdate(id, formData);
//     } else {
//       return handleGeneralUpdate(id, formData);
//     }
//   } catch (error: any) {
//     console.error("Error updating task:", error);
//     return NextResponse.json(
//       { error: "Failed to update task", details: error.message },
//       { status: 500 },
//     );
//   }
// }

// // Handle general task updates
// async function handleGeneralUpdate(taskId: string, formData: FormData) {
//   try {
//     // Parse form data - REMOVED priority
//     const code = formData.get("code") as string;
//     const company = formData.get("company") as string;
//     const contact = formData.get("contact") as string;
//     const working = formData.get("working") as string;
//     const dateTime = formData.get("dateTime") as string;
//     const softwareType = formData.get("softwareType") as string;
//     const status = formData.get("status") as string;
//     const assigned = formData.get("assigned") as string;
//     const assignedTo = formData.get("assignedTo") as string | null;
//     const approved = formData.get("approved") as string;
//     const unposted = formData.get("unposted") as string;
//     const TaskRemarks = formData.get("TaskRemarks") as string | null;

//     // Get existing attachments
//     const tasksAttachmentField = formData.get("TasksAttachment") as string;
//     let existingAttachments: string[] = [];

//     if (tasksAttachmentField) {
//       try {
//         existingAttachments = JSON.parse(tasksAttachmentField);
//       } catch (error) {
//         console.error("Failed to parse TasksAttachment:", tasksAttachmentField);
//         existingAttachments = [];
//       }
//     }

//     const newAttachmentsCount =
//       parseInt(formData.get("newAttachmentsCount") as string) || 0;

//     // Validate required fields - REMOVED priority validation
//     if (
//       !taskId ||
//       !code ||
//       !company ||
//       !contact ||
//       !working ||
//       !dateTime ||
//       !softwareType ||
//       !status
//     ) {
//       return NextResponse.json(
//         {
//           error:
//             "Missing required fields: code, company, contact, working, dateTime, softwareType, and status are required",
//         },
//         { status: 400 },
//       );
//     }

//     // Validate softwareType
//     if (!(await isValidActiveSoftwareType(softwareType))) {
//       return NextResponse.json(
//         {
//           error: `Invalid software type: "${softwareType}" is not an active software type.`,
//         },
//         { status: 400 },
//       );
//     }

//     // Find existing task
//     const existingTask = await Task.findById(taskId);
//     if (!existingTask) {
//       return NextResponse.json({ error: "Task not found" }, { status: 404 });
//     }

//     let filePaths = [...existingAttachments];

//     // Handle new file uploads
//     if (newAttachmentsCount > 0) {
//       const gfs = await getGridFS();

//       for (let i = 0; i < newAttachmentsCount; i++) {
//         const file = formData.get(`newAttachments_${i}`) as File | null;

//         if (file && file.size > 0) {
//           if (!validateFileType(file)) {
//             return NextResponse.json(
//               { error: "Only PDF, image, Excel, and Word files are allowed" },
//               { status: 400 },
//             );
//           }

//           if (!validateFileSize(file)) {
//             return NextResponse.json(
//               { error: "File size exceeds 10MB" },
//               { status: 400 },
//             );
//           }

//           const bytes = await file.arrayBuffer();
//           const buffer = Buffer.from(bytes);

//           const uploadStream = gfs.openUploadStream(file.name, {
//             contentType: file.type || undefined,
//             metadata: {
//               originalName: file.name,
//               uploadedAt: new Date(),
//               taskCode: code,
//             },
//           });

//           await new Promise<void>((resolve, reject) => {
//             uploadStream.end(buffer);
//             uploadStream.on("finish", () => resolve());
//             uploadStream.on("error", (err) => reject(err));
//           });

//           filePaths.push(uploadStream.id.toString());
//         }
//       }
//     }

//     // Parse JSON fields
//     let companyObj, contactObj, assignedToObj;

//     try {
//       companyObj = typeof company === "string" ? JSON.parse(company) : company;
//     } catch (error) {
//       return NextResponse.json(
//         { error: "Invalid company data format" },
//         { status: 400 },
//       );
//     }

//     try {
//       contactObj = typeof contact === "string" ? JSON.parse(contact) : contact;
//     } catch (error) {
//       return NextResponse.json(
//         { error: "Invalid contact data format" },
//         { status: 400 },
//       );
//     }

//     try {
//       assignedToObj = assignedTo
//         ? typeof assignedTo === "string"
//           ? JSON.parse(assignedTo)
//           : assignedTo
//         : null;
//     } catch (error) {
//       return NextResponse.json(
//         { error: "Invalid assignedTo data format" },
//         { status: 400 },
//       );
//     }

//     // Prepare update data - REMOVED priority
//     const updateData = {
//       code,
//       company: companyObj,
//       contact: contactObj,
//       working,
//       dateTime,
//       softwareType,
//       status,
//       assigned: assigned === "true",
//       assignedTo: assignedToObj,
//       approved: approved === "true",
//       unposted: unposted === "true",
//       TaskRemarks: TaskRemarks || "",
//       TasksAttachment: filePaths,
//     };

//     console.log("Updating task with softwareType:", softwareType);

//     const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
//       new: true,
//       runValidators: true,
//     }).lean();

//     // Broadcast SSE update
//     const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
//     sseManager.broadcast("tasks", allTasks);

//     return NextResponse.json(updatedTask);
//   } catch (error: any) {
//     console.error("Error in handleGeneralUpdate:", error);
//     throw error;
//   }
// }

// // Handle completion approval updates
// async function handleCompletionUpdate(taskId: string, formData: FormData) {
//   try {
//     const completionApproved = formData.get("completionApproved") === "true";
//     const completionApprovedAt = formData.get("completionApprovedAt") as string;
//     const finalStatus = formData.get("finalStatus") as string;
//     const status = formData.get("status") as string;
//     const completionRemarks = formData.get("completionRemarks") as string;
//     const rejectionRemarks = formData.get("rejectionRemarks") as string;
//     const timeTaken = formData.get("timeTaken") as string;

//     const completionAttachmentFiles: File[] = [];
//     const rejectionAttachmentFiles: File[] = [];

//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File && value.size > 0) {
//         if (key === "completionAttachment") {
//           completionAttachmentFiles.push(value);
//         } else if (key === "rejectionAttachment") {
//           rejectionAttachmentFiles.push(value);
//         }
//       }
//     }

//     if (!taskId || !finalStatus || !status) {
//       return NextResponse.json(
//         { error: "Missing required fields for completion approval" },
//         { status: 400 },
//       );
//     }

//     const existingTask = await Task.findById(taskId);
//     if (!existingTask) {
//       return NextResponse.json({ error: "Task not found" }, { status: 404 });
//     }

//     let completionAttachmentPaths: string[] =
//       existingTask.completionAttachment || [];
//     let rejectionAttachmentPaths: string[] =
//       existingTask.rejectionAttachment || [];

//     const gfs = await getGridFS();

//     if (completionAttachmentFiles.length > 0) {
//       completionAttachmentPaths = [];
//       for (const file of completionAttachmentFiles) {
//         if (!validateFileType(file)) {
//           return NextResponse.json(
//             { error: "Only PDF, image, Excel, and Word files are allowed" },
//             { status: 400 },
//           );
//         }
//         if (!validateFileSize(file)) {
//           return NextResponse.json(
//             { error: "File size exceeds 10MB" },
//             { status: 400 },
//           );
//         }
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);
//         const uploadStream = gfs.openUploadStream(file.name, {
//           contentType: file.type || "application/octet-stream",
//           metadata: {
//             originalName: file.name,
//             uploadedAt: new Date(),
//             taskId: taskId,
//             attachmentType: "completion",
//           },
//         });
//         await new Promise<void>((resolve, reject) => {
//           uploadStream.end(buffer);
//           uploadStream.on("finish", () => resolve());
//           uploadStream.on("error", (err) => reject(err));
//         });
//         completionAttachmentPaths.push(uploadStream.id.toString());
//       }
//     }

//     if (rejectionAttachmentFiles.length > 0) {
//       rejectionAttachmentPaths = [];
//       for (const file of rejectionAttachmentFiles) {
//         if (!validateFileType(file)) {
//           return NextResponse.json(
//             { error: "Only PDF, image, Excel, and Word files are allowed" },
//             { status: 400 },
//           );
//         }
//         if (!validateFileSize(file)) {
//           return NextResponse.json(
//             { error: "File size exceeds 10MB" },
//             { status: 400 },
//           );
//         }
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);
//         const uploadStream = gfs.openUploadStream(file.name, {
//           contentType: file.type || "application/octet-stream",
//           metadata: {
//             originalName: file.name,
//             uploadedAt: new Date(),
//             taskId: taskId,
//             attachmentType: "rejection",
//           },
//         });
//         await new Promise<void>((resolve, reject) => {
//           uploadStream.end(buffer);
//           uploadStream.on("finish", () => resolve());
//           uploadStream.on("error", (err) => reject(err));
//         });
//         rejectionAttachmentPaths.push(uploadStream.id.toString());
//       }
//     }

//     const updateData: any = {
//       completionApproved,
//       completionApprovedAt: completionApprovedAt
//         ? new Date(completionApprovedAt)
//         : new Date(),
//       finalStatus,
//       status,
//     };

//     if (finalStatus === "rejected") {
//       updateData.rejectionRemarks = rejectionRemarks || "";
//       updateData.rejectionAttachment = rejectionAttachmentPaths;
//     } else {
//       updateData.completionRemarks = completionRemarks || "";
//       updateData.completionAttachment = completionAttachmentPaths;
//     }

//     if (timeTaken) {
//       updateData.timeTaken = parseInt(timeTaken);
//     }

//     const updatedTask = await Task.findByIdAndUpdate(
//       taskId,
//       { $set: updateData },
//       { new: true, runValidators: true },
//     ).lean();

//     const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
//     sseManager.broadcast("tasks", allTasks);

//     return NextResponse.json(updatedTask);
//   } catch (error: any) {
//     console.error("Error in handleCompletionUpdate:", error);
//     throw error;
//   }
// }

// export async function DELETE(request: Request, { params }: Params) {
//   await connectDB;
//   try {
//     const { id } = await params;

//     const task = await Task.findById(id);
//     if (!task) {
//       return NextResponse.json({ error: "Task not found" }, { status: 404 });
//     }

//     const gfs = await getGridFS();

//     // Delete all attachments
//     const attachmentFields = [
//       "TasksAttachment",
//       "completionAttachment",
//       "rejectionAttachment",
//     ];
//     for (const field of attachmentFields) {
//       if (task[field] && task[field].length > 0) {
//         for (const fileId of task[field]) {
//           if (mongoose.Types.ObjectId.isValid(fileId)) {
//             try {
//               await gfs.delete(new mongoose.Types.ObjectId(fileId));
//             } catch (error) {
//               console.error(`Error deleting file ${fileId}:`, error);
//             }
//           }
//         }
//       }
//     }

//     await Task.findByIdAndDelete(id);

//     const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
//     sseManager.broadcast("tasks", allTasks);

//     return NextResponse.json({ message: "Task deleted successfully" });
//   } catch (error: any) {
//     console.error("Error deleting task:", error);
//     return NextResponse.json(
//       { error: "Failed to delete task", details: error.message },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { getGridFS } from "@/lib/gridfs";
import { validateFileType, validateFileSize } from "@/lib/downloadUtils";
import { sseManager } from "@/lib/sse";
import mongoose from "mongoose";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";

// Next.js 16 Route Handler context definition
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Software types are now managed dynamically by Administrators from
// Dashboard → Software Types (see models/SoftwareType.ts and
// lib/softwareTypes.ts) instead of this hardcoded list.

export async function GET(request: NextRequest, { params }: RouteContext) {
  await dbConnect();
  try {
    const { id } = await params;

    const task = await Task.findById(id).lean().exec();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error: any) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  await dbConnect();
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 },
      );
    }

    const formData = await request.formData();

    console.log(
      "Received form data fields for task update:",
      Array.from(formData.entries()),
    );

    // Determine update type
    const completionApproved = formData.get("completionApproved");
    const finalStatus = formData.get("finalStatus");

    const isCompletionUpdate = completionApproved === "true" && finalStatus;

    console.log("Update type detection:", {
      completionApproved,
      finalStatus,
      isCompletionUpdate,
    });

    if (isCompletionUpdate) {
      return handleCompletionUpdate(id, formData);
    } else {
      return handleGeneralUpdate(id, formData);
    }
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task", details: error.message },
      { status: 500 },
    );
  }
}

// Handle general task updates
async function handleGeneralUpdate(taskId: string, formData: FormData) {
  try {
    // Parse form data - REMOVED priority
    const code = formData.get("code") as string;
    const company = formData.get("company") as string;
    const contact = formData.get("contact") as string;
    const working = formData.get("working") as string;
    const dateTime = formData.get("dateTime") as string;
    const softwareType = formData.get("softwareType") as string;
    const status = formData.get("status") as string;
    const assigned = formData.get("assigned") as string;
    const assignedTo = formData.get("assignedTo") as string | null;
    const approved = formData.get("approved") as string;
    const unposted = formData.get("unposted") as string;
    const TaskRemarks = formData.get("TaskRemarks") as string | null;

    // Get existing attachments
    const tasksAttachmentField = formData.get("TasksAttachment") as string;
    let existingAttachments: string[] = [];

    if (tasksAttachmentField) {
      try {
        existingAttachments = JSON.parse(tasksAttachmentField);
      } catch (error) {
        console.error("Failed to parse TasksAttachment:", tasksAttachmentField);
        existingAttachments = [];
      }
    }

    const newAttachmentsCount =
      parseInt(formData.get("newAttachmentsCount") as string) || 0;

    // Validate required fields - REMOVED priority validation
    if (
      !taskId ||
      !code ||
      !company ||
      !contact ||
      !working ||
      !dateTime ||
      !softwareType ||
      !status
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: code, company, contact, working, dateTime, softwareType, and status are required",
        },
        { status: 400 },
      );
    }

    // Validate softwareType
    if (!(await isValidActiveSoftwareType(softwareType))) {
      return NextResponse.json(
        {
          error: `Invalid software type: "${softwareType}" is not an active software type.`,
        },
        { status: 400 },
      );
    }

    // Find existing task
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let filePaths = [...existingAttachments];

    // Handle new file uploads
    if (newAttachmentsCount > 0) {
      const gfs = await getGridFS();

      for (let i = 0; i < newAttachmentsCount; i++) {
        const file = formData.get(`newAttachments_${i}`) as File | null;

        if (file && file.size > 0) {
          if (!validateFileType(file)) {
            return NextResponse.json(
              { error: "Only PDF, image, Excel, and Word files are allowed" },
              { status: 400 },
            );
          }

          if (!validateFileSize(file)) {
            return NextResponse.json(
              { error: "File size exceeds 10MB" },
              { status: 400 },
            );
          }

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadStream = gfs.openUploadStream(file.name, {
            contentType: file.type || undefined,
            metadata: {
              originalName: file.name,
              uploadedAt: new Date(),
              taskCode: code,
            },
          });

          await new Promise<void>((resolve, reject) => {
            uploadStream.end(buffer);
            uploadStream.on("finish", () => resolve());
            uploadStream.on("error", (err) => reject(err));
          });

          filePaths.push(uploadStream.id.toString());
        }
      }
    }

    // Parse JSON fields
    let companyObj, contactObj, assignedToObj;

    try {
      companyObj = typeof company === "string" ? JSON.parse(company) : company;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid company data format" },
        { status: 400 },
      );
    }

    try {
      contactObj = typeof contact === "string" ? JSON.parse(contact) : contact;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid contact data format" },
        { status: 400 },
      );
    }

    try {
      assignedToObj = assignedTo
        ? typeof assignedTo === "string"
          ? JSON.parse(assignedTo)
          : assignedTo
        : null;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid assignedTo data format" },
        { status: 400 },
      );
    }

    // Prepare update data - REMOVED priority
    const updateData = {
      code,
      company: companyObj,
      contact: contactObj,
      working,
      dateTime,
      softwareType,
      status,
      assigned: assigned === "true",
      assignedTo: assignedToObj,
      approved: approved === "true",
      unposted: unposted === "true",
      TaskRemarks: TaskRemarks || "",
      TasksAttachment: filePaths,
    };

    console.log("Updating task with softwareType:", softwareType);

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    // Broadcast SSE update
    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
    sseManager.broadcast("tasks", allTasks);

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Error in handleGeneralUpdate:", error);
    throw error;
  }
}

// Handle completion approval updates
async function handleCompletionUpdate(taskId: string, formData: FormData) {
  try {
    const completionApproved = formData.get("completionApproved") === "true";
    const completionApprovedAt = formData.get("completionApprovedAt") as string;
    const finalStatus = formData.get("finalStatus") as string;
    const status = formData.get("status") as string;
    const completionRemarks = formData.get("completionRemarks") as string;
    const rejectionRemarks = formData.get("rejectionRemarks") as string;
    const timeTaken = formData.get("timeTaken") as string;

    const completionAttachmentFiles: File[] = [];
    const rejectionAttachmentFiles: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        if (key === "completionAttachment") {
          completionAttachmentFiles.push(value);
        } else if (key === "rejectionAttachment") {
          rejectionAttachmentFiles.push(value);
        }
      }
    }

    if (!taskId || !finalStatus || !status) {
      return NextResponse.json(
        { error: "Missing required fields for completion approval" },
        { status: 400 },
      );
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let completionAttachmentPaths: string[] =
      existingTask.completionAttachment || [];
    let rejectionAttachmentPaths: string[] =
      existingTask.rejectionAttachment || [];

    const gfs = await getGridFS();

    if (completionAttachmentFiles.length > 0) {
      completionAttachmentPaths = [];
      for (const file of completionAttachmentFiles) {
        if (!validateFileType(file)) {
          return NextResponse.json(
            { error: "Only PDF, image, Excel, and Word files are allowed" },
            { status: 400 },
          );
        }
        if (!validateFileSize(file)) {
          return NextResponse.json(
            { error: "File size exceeds 10MB" },
            { status: 400 },
          );
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type || "application/octet-stream",
          metadata: {
            originalName: file.name,
            uploadedAt: new Date(),
            taskId: taskId,
            attachmentType: "completion",
          },
        });
        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer);
          uploadStream.on("finish", () => resolve());
          uploadStream.on("error", (err) => reject(err));
        });
        completionAttachmentPaths.push(uploadStream.id.toString());
      }
    }

    if (rejectionAttachmentFiles.length > 0) {
      rejectionAttachmentPaths = [];
      for (const file of rejectionAttachmentFiles) {
        if (!validateFileType(file)) {
          return NextResponse.json(
            { error: "Only PDF, image, Excel, and Word files are allowed" },
            { status: 400 },
          );
        }
        if (!validateFileSize(file)) {
          return NextResponse.json(
            { error: "File size exceeds 10MB" },
            { status: 400 },
          );
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadStream = gfs.openUploadStream(file.name, {
          contentType: file.type || "application/octet-stream",
          metadata: {
            originalName: file.name,
            uploadedAt: new Date(),
            taskId: taskId,
            attachmentType: "rejection",
          },
        });
        await new Promise<void>((resolve, reject) => {
          uploadStream.end(buffer);
          uploadStream.on("finish", () => resolve());
          uploadStream.on("error", (err) => reject(err));
        });
        rejectionAttachmentPaths.push(uploadStream.id.toString());
      }
    }

    const updateData: any = {
      completionApproved,
      completionApprovedAt: completionApprovedAt
        ? new Date(completionApprovedAt)
        : new Date(),
      finalStatus,
      status,
    };

    if (finalStatus === "rejected") {
      updateData.rejectionRemarks = rejectionRemarks || "";
      updateData.rejectionAttachment = rejectionAttachmentPaths;
    } else {
      updateData.completionRemarks = completionRemarks || "";
      updateData.completionAttachment = completionAttachmentPaths;
    }

    if (timeTaken) {
      updateData.timeTaken = parseInt(timeTaken);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
    sseManager.broadcast("tasks", allTasks);

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Error in handleCompletionUpdate:", error);
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  await dbConnect();
  try {
    const { id } = await params;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const gfs = await getGridFS();

    // Delete all attachments
    const attachmentFields = [
      "TasksAttachment",
      "completionAttachment",
      "rejectionAttachment",
    ];
    for (const field of attachmentFields) {
      if (task[field] && task[field].length > 0) {
        for (const fileId of task[field]) {
          if (mongoose.Types.ObjectId.isValid(fileId)) {
            try {
              await gfs.delete(new mongoose.Types.ObjectId(fileId));
            } catch (error) {
              console.error(`Error deleting file ${fileId}:`, error);
            }
          }
        }
      }
    }

    await Task.findByIdAndDelete(id);

    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec();
    sseManager.broadcast("tasks", allTasks);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task", details: error.message },
      { status: 500 },
    );
  }
}
