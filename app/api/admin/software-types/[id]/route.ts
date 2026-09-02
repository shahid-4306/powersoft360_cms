import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import SoftwareType from "@/models/SoftwareType";
import CompanyInformation from "@/models/CompanyInformation";
import Task from "@/models/Task";
import OnlineComplaint from "@/models/OnlineComplaint";
import UserRegister from "@/models/UserRegister";
import { verifySessionCookie } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Counts how many existing records reference this software type name,
 * across every collection that stores one. Used to protect against
 * deleting a type that's still in active use — the admin is guided to
 * deactivate instead, which keeps historical records intact while
 * hiding the type from all future dropdowns.
 */
async function countReferences(name: string) {
  const nameFilter = { $regex: `^${escapeRegex(name)}$`, $options: "i" };

  const [companies, tasks, complaints, registrations] = await Promise.all([
    CompanyInformation.countDocuments({
      "softwareInformation.softwareType": nameFilter,
    }),
    Task.countDocuments({ softwareType: nameFilter }),
    OnlineComplaint.countDocuments({ softwareType: nameFilter }),
    UserRegister.countDocuments({ softwareType: nameFilter }),
  ]);

  return {
    companies,
    tasks,
    complaints,
    registrations,
    total: companies + tasks + complaints + registrations,
  };
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
      return NextResponse.json({ message: "Invalid software type id" }, { status: 400 });
    }

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const softwareType = await SoftwareType.findById(id);

    if (!softwareType) {
      return NextResponse.json({ message: "Software type not found" }, { status: 404 });
    }

    if (body.name !== undefined) {
      const name = body.name.toString().trim();
      if (!name) {
        return NextResponse.json(
          { message: "Software type name cannot be empty" },
          { status: 400 },
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { message: "Software type name must not exceed 100 characters" },
          { status: 400 },
        );
      }

      const duplicate = await SoftwareType.findOne({
        _id: { $ne: id },
        name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      }).lean();

      if (duplicate) {
        return NextResponse.json(
          { message: `A software type named "${name}" already exists.` },
          { status: 409 },
        );
      }

      softwareType.name = name;
    }

    if (body.description !== undefined) {
      softwareType.description = body.description.toString().trim();
    }

    if (body.isActive !== undefined) {
      softwareType.isActive = !!body.isActive;
    }

    if (body.sortOrder !== undefined && typeof body.sortOrder === "number") {
      softwareType.sortOrder = body.sortOrder;
    }

    await softwareType.save();

    return NextResponse.json({
      message: "Software type updated successfully",
      softwareType,
    });
  } catch (error: any) {
    console.error("❌ Error updating software type:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "A software type with this name already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to update software type" },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE → Permanently remove a software type.
// Blocked (409) if any existing company, task, complaint, or
// registration still references it — deactivate it instead to
// preserve historical data integrity.
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
      return NextResponse.json({ message: "Invalid software type id" }, { status: 400 });
    }

    await dbConnect();

    const softwareType = await SoftwareType.findById(id);
    if (!softwareType) {
      return NextResponse.json({ message: "Software type not found" }, { status: 404 });
    }

    const references = await countReferences(softwareType.name);

    if (references.total > 0) {
      return NextResponse.json(
        {
          message: `"${softwareType.name}" is still referenced by ${references.total} existing record(s) (companies: ${references.companies}, tasks: ${references.tasks}, complaints: ${references.complaints}, registrations: ${references.registrations}). Deactivate it instead to hide it from new selections while keeping historical records intact.`,
          references,
        },
        { status: 409 },
      );
    }

    await SoftwareType.findByIdAndDelete(id);

    return NextResponse.json({ message: "Software type deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting software type:", error);
    return NextResponse.json(
      { message: "Failed to delete software type" },
      { status: 500 },
    );
  }
}
