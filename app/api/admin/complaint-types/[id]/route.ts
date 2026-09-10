import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import ComplaintType from "@/models/ComplaintType";
import OnlineComplaint from "@/models/OnlineComplaint";
import { verifySessionCookie } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Counts how many existing online complaints still reference this
 * complaint type name. Used to protect against deleting a type that's
 * still in active use — the admin is guided to deactivate instead,
 * which keeps historical records intact while hiding the type from
 * all future dropdowns (mirrors the SoftwareType delete guard).
 */
async function countReferences(name: string) {
  const nameFilter = { $regex: `^${escapeRegex(name)}$`, $options: "i" };
  const complaints = await OnlineComplaint.countDocuments({
    complaintType: nameFilter,
  });
  return { complaints, total: complaints };
}

// ======================================================
// PUT → Edit name/description, or activate/deactivate.
// Body: { name?, description?, isActive? }
// ======================================================
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid complaint type id" },
        { status: 400 },
      );
    }

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const complaintType = await ComplaintType.findById(id);

    if (!complaintType) {
      return NextResponse.json(
        { message: "Complaint type not found" },
        { status: 404 },
      );
    }

    if (body.name !== undefined) {
      const name = body.name.toString().trim();
      if (!name) {
        return NextResponse.json(
          { message: "Complaint type name cannot be empty" },
          { status: 400 },
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { message: "Complaint type name must not exceed 100 characters" },
          { status: 400 },
        );
      }

      const duplicate = await ComplaintType.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      }).lean();

      if (duplicate) {
        return NextResponse.json(
          { message: `A complaint type named "${name}" already exists.` },
          { status: 409 },
        );
      }

      complaintType.name = name;
    }

    if (body.description !== undefined) {
      complaintType.description = body.description.toString().trim();
    }

    if (body.isActive !== undefined) {
      complaintType.isActive = !!body.isActive;
    }

    if (body.sortOrder !== undefined && typeof body.sortOrder === "number") {
      complaintType.sortOrder = body.sortOrder;
    }

    await complaintType.save();

    return NextResponse.json({
      message: "Complaint type updated successfully",
      complaintType,
    });
  } catch (error: any) {
    console.error("❌ Error updating complaint type:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "A complaint type with this name already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to update complaint type" },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE → Permanently remove a complaint type.
// Blocked (409) if any existing complaint still references it —
// deactivate it instead to preserve historical data integrity.
// ======================================================
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid complaint type id" },
        { status: 400 },
      );
    }

    await dbConnect();

    const complaintType = await ComplaintType.findById(id);
    if (!complaintType) {
      return NextResponse.json(
        { message: "Complaint type not found" },
        { status: 404 },
      );
    }

    const references = await countReferences(complaintType.name);

    if (references.total > 0) {
      return NextResponse.json(
        {
          message: `"${complaintType.name}" is still referenced by ${references.total} existing complaint(s). Deactivate it instead to hide it from new selections while keeping historical records intact.`,
          references,
        },
        { status: 409 },
      );
    }

    await ComplaintType.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Complaint type deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting complaint type:", error);
    return NextResponse.json(
      { message: "Failed to delete complaint type" },
      { status: 500 },
    );
  }
}
