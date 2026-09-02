// import { NextResponse } from "next/server"
// import dbConnect from "@/lib/db"
// import Project from "@/models/Project"
// import mongoose from "mongoose"

// const connectDB = dbConnect()

// interface Params {
//   params: {
//     id: string
//   }
// }

// export async function GET(request: Request, { params }: Params) {
//   await connectDB
//   try {
//     const project = await Project.findById(params.id).lean().exec()

//     if (!project) {
//       return NextResponse.json(
//         { error: "Project not found" },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json(project, { status: 200 })
//   } catch (error: any) {
//     console.error("Error fetching project:", error)
//     return NextResponse.json(
//       { error: "Failed to fetch project" },
//       { status: 500 }
//     )
//   }
// }

// export async function PUT(request: Request, ctx: any) {
//   await dbConnect

//   try {
//     const params = await ctx.params
//     const body = await request.json()

//     // Validate required fields
//     if (!body.companyCode || !body.companyName || !body.projectName || !body.projectPath) {
//       return NextResponse.json(
//         { error: "Missing required fields: companyCode, companyName, projectName, projectPath" },
//         { status: 400 }
//       )
//     }

//     const projectId = new mongoose.Types.ObjectId(params.id)

//     // Get current project
//     const currentProject = await Project.findById(projectId)

//     if (!currentProject) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 })
//     }

//     // Only check duplicates if the projectName changed
//     if (currentProject.projectName !== body.projectName) {
//       const existingProject = await Project.findOne({
//         projectName: { $regex: new RegExp(`^${body.projectName}$`, "i") },
//         _id: { $ne: projectId }
//       })

//       if (existingProject) {
//         return NextResponse.json(
//           { error: "Project name already exists" },
//           { status: 409 }
//         )
//       }
//     }

//     const updatedProject = await Project.findByIdAndUpdate(
//       projectId,
//       body,
//       {
//         new: true,
//         runValidators: true,
//         context: "query"
//       }
//     )

//     return NextResponse.json(updatedProject, { status: 200 })

//   } catch (error: any) {
//     console.error("Error updating project:", error)

//     if (error.code === 11000) {
//       return NextResponse.json(
//         { error: "Project name must be unique" },
//         { status: 409 }
//       )
//     }

//     return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
//   }
// }

// export async function DELETE(
//   request: Request,
//   context: { params: { id: string } | Promise<{ id: string }> }
// ) {
//   await dbConnect();
//   const params = await context.params;

//   try {
//     const deletedProject = await Project.findByIdAndDelete(params.id).lean().exec();

//     if (!deletedProject) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error deleting project:", error);
//     return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import mongoose from "mongoose";

// Next.js 16 standard context type definition
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET single project by ID
export async function GET(request: NextRequest, { params }: RouteContext) {
  await dbConnect();
  try {
    const { id } = await params;
    const project = await Project.findById(id).lean().exec();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PUT / Update project by ID
export async function PUT(request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();

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

    const projectId = new mongoose.Types.ObjectId(id);

    // Get current project
    const currentProject = await Project.findById(projectId);

    if (!currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only check duplicates if the projectName changed
    if (currentProject.projectName !== body.projectName) {
      const existingProject = await Project.findOne({
        projectName: { $regex: new RegExp(`^${body.projectName}$`, "i") },
        _id: { $ne: projectId },
      });

      if (existingProject) {
        return NextResponse.json(
          { error: "Project name already exists" },
          { status: 409 },
        );
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(projectId, body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error: any) {
    console.error("Error updating project:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Project name must be unique" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE project by ID
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  await dbConnect();

  try {
    const { id } = await params;
    const deletedProject = await Project.findByIdAndDelete(id).lean().exec();

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
