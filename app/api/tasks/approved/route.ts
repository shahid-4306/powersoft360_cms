import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function GET() {
  await dbConnect();

  try {
    // Find tasks with status 'assigned' or approved
    const approvedTasks = await Task.find({
      $or: [
        { status: 'assigned' },
        { status: 'Assigned' },
        { approved: true }
      ]
    })
      .populate('company')
      .populate('contact')
      .populate('assignedTo.id')
      .sort({ assignedDate: -1 })
      .lean();

    return NextResponse.json(approvedTasks);
  } catch (error: any) {
    console.error("Error fetching approved tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch approved tasks", error: error.message },
      { status: 500 }
    );
  }
}