import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";

export async function GET() {
  await dbConnect();

  try {
    // Find tasks with status 'pending' or not approved
    const pendingTasks = await Task.find({
      $or: [
        { status: 'pending' },
        { status: 'Pending' },
        { approved: false },
        { approved: { $exists: false } }
      ]
    })
      .populate('company')
      .populate('contact')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pendingTasks);
  } catch (error: any) {
    console.error("Error fetching pending tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch pending tasks", error: error.message },
      { status: 500 }
    );
  }
}