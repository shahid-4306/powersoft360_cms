// // app/api/online-complaints/[id]/route.ts
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import OnlineComplaint from "@/models/OnlineComplaint";
// import mongoose from "mongoose";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await dbConnect();

//   try {
//     const { id } = params;

//     // Build query to find complaint by either _id or complaintNumber
//     const query = mongoose.Types.ObjectId.isValid(id)
//       ? { _id: id }
//       : { complaintNumber: id };

//     const complaint = await OnlineComplaint.findOne(query)
//       .select('-__v') // Exclude version key
//       .lean();

//     if (!complaint) {
//       return NextResponse.json({
//         message: "Complaint not found"
//       }, { status: 404 });
//     }

//     // Format dates for JSON response
//     const formattedComplaint = {
//       ...complaint,
//       _id: complaint._id.toString(),
//       createdAt: complaint.createdAt ? complaint.createdAt.toISOString() : null,
//       updatedAt: complaint.updatedAt ? complaint.updatedAt.toISOString() : null,
//       assignedDate: complaint.assignedDate ? complaint.assignedDate.toISOString() : null,
//       resolvedDate: complaint.resolvedDate ? complaint.resolvedDate.toISOString() : null,
//     };

//     return NextResponse.json(formattedComplaint);

//   } catch (error: any) {
//     console.error("Error fetching complaint:", error);
//     return NextResponse.json({
//       message: "Failed to fetch complaint",
//       error: error?.message || String(error)
//     }, { status: 500 });
//   }
// }
// // DELETE function to delete a complaint
// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> } // params is a Promise
// ) {
//   await dbConnect();

//   try {
//     const { id } = await params; // Await params to get the actual value

//     if (!id) {
//       return NextResponse.json({
//         message: "ID is required"
//       }, { status: 400 });
//     }

//     console.log("Deleting complaint with ID:", id);

//     // Build query to find complaint by either _id or complaintNumber
//     const query = mongoose.Types.ObjectId.isValid(id)
//       ? { _id: id }
//       : { complaintNumber: id };

//     console.log("Query for deletion:", query);

//     // Find and delete the complaint
//     const deletedComplaint = await OnlineComplaint.findOneAndDelete(query);

//     if (!deletedComplaint) {
//       console.log("Complaint not found with query:", query);
//       return NextResponse.json({
//         message: "Complaint not found"
//       }, { status: 404 });
//     }

//     console.log("Successfully deleted complaint:", deletedComplaint._id);

//     return NextResponse.json({
//       message: "Complaint deleted successfully",
//       deletedComplaint: {
//         _id: deletedComplaint._id.toString(),
//         complaintNumber: deletedComplaint.complaintNumber
//       }
//     });

//   } catch (error: any) {
//     console.error("Error deleting complaint:", error);
//     return NextResponse.json({
//       message: "Failed to delete complaint",
//       error: error?.message || String(error)
//     }, { status: 500 });
//   }
// }
// app/api/online-complaints/[id]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  try {
    const { id } = await params;

    // Build query to find complaint by either _id or complaintNumber
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { complaintNumber: id };

    const complaint = await OnlineComplaint.findOne(query)
      .select("-__v") // Exclude version key
      .lean();

    if (!complaint) {
      return NextResponse.json(
        {
          message: "Complaint not found",
        },
        { status: 404 },
      );
    }

    // Format dates for JSON response
    const formattedComplaint = {
      ...complaint,
      _id: complaint._id.toString(),
      createdAt: complaint.createdAt ? complaint.createdAt.toISOString() : null,
      updatedAt: complaint.updatedAt ? complaint.updatedAt.toISOString() : null,
      assignedDate: complaint.assignedDate
        ? complaint.assignedDate.toISOString()
        : null,
      resolvedDate: complaint.resolvedDate
        ? complaint.resolvedDate.toISOString()
        : null,
    };

    return NextResponse.json(formattedComplaint);
  } catch (error: any) {
    console.error("Error fetching complaint:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch complaint",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE function to delete a complaint
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "ID is required",
        },
        { status: 400 },
      );
    }

    console.log("Deleting complaint with ID:", id);

    // Build query to find complaint by either _id or complaintNumber
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { complaintNumber: id };

    console.log("Query for deletion:", query);

    // Find and delete the complaint
    const deletedComplaint = await OnlineComplaint.findOneAndDelete(query);

    if (!deletedComplaint) {
      console.log("Complaint not found with query:", query);

      return NextResponse.json(
        {
          message: "Complaint not found",
        },
        { status: 404 },
      );
    }

    console.log("Successfully deleted complaint:", deletedComplaint._id);

    return NextResponse.json({
      message: "Complaint deleted successfully",
      deletedComplaint: {
        _id: deletedComplaint._id.toString(),
        complaintNumber: deletedComplaint.complaintNumber,
      },
    });
  } catch (error: any) {
    console.error("Error deleting complaint:", error);

    return NextResponse.json(
      {
        message: "Failed to delete complaint",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
