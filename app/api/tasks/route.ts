import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Task from "@/models/Task"
import { getGridFS } from "@/lib/gridfs"
import { validateFileType, validateFileSize } from "@/lib/downloadUtils"
import { sseManager } from "@/lib/sse"
import { notifyTaskCreated } from "@/lib/notification-events"

// Connect to database once
const connectDB = dbConnect()

export async function GET() {
  await connectDB
  try {
    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec()
    
    return NextResponse.json(tasks, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  await connectDB
  try {
    const formData = await req.formData()
    console.log("POST FormData entries:", Array.from(formData.entries()))

    // Parse fields
    const code = (formData.get("code") as string) || ""
    const companyRaw = formData.get("company") as string | null
    const contactRaw = formData.get("contact") as string | null
    const working = (formData.get("working") as string) || ""
    const dateTimeRaw = formData.get("dateTime") as string | null
    const priority = (formData.get("priority") as string) || ""
    const status = (formData.get("status") as string) || "pending"
    const createdAtRaw = formData.get("createdAt") as string | null
    const createdBy = (formData.get("createdBy") as string) || ""
    const assigned = (formData.get("assigned") as string) === "true"
    const approved = (formData.get("approved") as string) === "false" // Default to false
    const unposted = (formData.get("unposted") as string) === "false" // Default to false
    const TaskRemarks = (formData.get("TaskRemarks") as string) || ""

    // Parse JSON fields safely
    let company = null
    let contact = null
    try {
      company = companyRaw ? JSON.parse(companyRaw) : null
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON for company" }, { status: 400 })
    }
    try {
      contact = contactRaw ? JSON.parse(contactRaw) : null
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON for contact" }, { status: 400 })
    }

    const dateTime = dateTimeRaw ? new Date(dateTimeRaw) : null
    const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date()

    // Validate required fields
    if (!code || !company || !contact || !working || !dateTime || !createdBy) {
      console.log("Missing required fields:", {
        code,
        company,
        contact,
        working,
        dateTime,
        createdBy,
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Files handling -> GridFS
    const filesCount = parseInt((formData.get("TasksAttachmentCount") as string) || "0", 10) || 0
    const attachmentIds: string[] = []

    const gfs = await getGridFS()

    for (let i = 0; i < filesCount; i++) {
      const file = formData.get(`TasksAttachment_${i}`) as File | null
      if (!file) continue

      // Validate file type and size
      if (!validateFileType(file)) {
        return NextResponse.json({ error: "Only PDF, image, Excel, and Word files are allowed" }, { status: 400 })
      }

      if (!validateFileSize(file)) {
        return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Open upload stream and write buffer
      const uploadStream = gfs.openUploadStream(file.name, {
        contentType: file.type || undefined,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date(),
          taskCode: code,
        },
      })

      // Write buffer and wait for finish
      await new Promise<void>((resolve, reject) => {
        uploadStream.end(buffer)
        uploadStream.on("finish", () => resolve())
        uploadStream.on("error", (err) => reject(err))
      })

      // Push the GridFS file id (string)
      attachmentIds.push(uploadStream.id.toString())
    }

    // Create and save task
    const taskData = {
      code,
      company,
      contact,
      working,
      dateTime,
      priority,
      status,
      createdAt,
      createdBy,
      assigned,
      approved,
      unposted,
      TaskRemarks,
      TasksAttachment: attachmentIds, // Store file ids from GridFS
    }

    const newTask = new Task(taskData)
    await newTask.save()

    // Broadcast SSE update
    const updatedTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec()
    sseManager.broadcast("tasks", updatedTasks)

    // Notification: alert users who can assign/manage tasks (non-blocking)
    notifyTaskCreated({ taskId: String(newTask._id), taskCode: code })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error: any) {
    console.error("Error creating task:", error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  await connectDB
  try {
    const { taskIds } = await req.json()

    // Validate taskIds
    if (!taskIds || (Array.isArray(taskIds) && taskIds.length === 0) || (!Array.isArray(taskIds) && !taskIds)) {
      return NextResponse.json({ error: "Invalid or empty taskIds" }, { status: 400 })
    }

    // Convert to array
    const ids = Array.isArray(taskIds) ? taskIds : [taskIds]

    // Bulk update - preserve original status
    const updatedTasks = await Task.updateMany(
      { _id: { $in: ids } },
      {
        unposted: true,
        unpostedAt: new Date().toISOString(),
        UnpostStatus: "unposted", // Set UnpostStatus
      }
    )

    // Broadcast SSE update
    const allTasks = await Task.find({}).sort({ createdAt: -1 }).lean().exec()
    sseManager.broadcast("tasks", allTasks)

    return NextResponse.json({
      message: "Tasks unposted successfully",
      modifiedCount: updatedTasks.modifiedCount,
    })
  } catch (error: any) {
    console.error("Error unposting tasks:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
  { 
    message: "Failed to unpost tasks",
    error: errorMessage 
  },
  { status: 500 }
)
  }
}