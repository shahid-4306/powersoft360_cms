import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { notifyProjectCreated } from "@/lib/notification-events";

// Connect to database once
const connectDB = dbConnect();

export async function GET() {
  await connectDB;
  try {
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await connectDB;
  try {
    const body = await req.json();

    // Validate required fields
    if (
      !body.companyCode ||
      !body.companyName ||
      !body.projectName ||
      !body.projectPath
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: companyCode, companyName, projectName, projectPath",
        },
        { status: 400 },
      );
    }

    // Check if project name already exists
    const existingProject = await Project.findOne({
      projectName: body.projectName,
    });
    if (existingProject) {
      return NextResponse.json(
        { error: "Project name already exists" },
        { status: 409 },
      );
    }

    const project = new Project(body);
    const savedProject = await project.save();

    // Notification: alert project viewers/managers (non-blocking)
    notifyProjectCreated({
      projectId: String(savedProject._id),
      projectName: savedProject.projectName,
    });

    return NextResponse.json(savedProject, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Project name must be unique" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}
