import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ComplaintType from "@/models/ComplaintType";
import { verifySessionCookie } from "@/lib/auth";
import { ensureDefaultComplaintTypes } from "@/lib/complaintTypes";

// ======================================================
// GET → List every complaint type (Active + Inactive) for the
// Administrator Dashboard. Protected: requires a valid admin session.
// ======================================================
export async function GET(req: NextRequest) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();
    await ensureDefaultComplaintTypes();

    const complaintTypes = await ComplaintType.find({})
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const counts = {
      total: complaintTypes.length,
      active: complaintTypes.filter((t: any) => t.isActive).length,
      inactive: complaintTypes.filter((t: any) => !t.isActive).length,
    };

    return NextResponse.json({ complaintTypes, counts });
  } catch (error: any) {
    console.error("❌ Error fetching complaint types:", error);
    return NextResponse.json(
      { message: "Failed to fetch complaint types" },
      { status: 500 },
    );
  }
}

// ======================================================
// POST → Create a new complaint type.
// Body: { name: string, description?: string, isActive?: boolean }
// ======================================================
export async function POST(req: NextRequest) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const name = (body?.name || "").toString().trim();
    const description = (body?.description || "").toString().trim();
    const isActive = body?.isActive === undefined ? true : !!body.isActive;

    if (!name) {
      return NextResponse.json(
        { message: "Complaint type name is required" },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Complaint type name must not exceed 100 characters" },
        { status: 400 },
      );
    }

    // Case-insensitive duplicate check (Mongo's unique index is case-sensitive)
    const existing = await ComplaintType.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    }).lean();

    if (existing) {
      return NextResponse.json(
        { message: `A complaint type named "${name}" already exists.` },
        { status: 409 },
      );
    }

    const lastByOrder = await ComplaintType.findOne({})
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const nextSortOrder =
      lastByOrder && typeof (lastByOrder as any).sortOrder === "number"
        ? (lastByOrder as any).sortOrder + 1
        : 0;

    const complaintType = await ComplaintType.create({
      name,
      description,
      isActive,
      sortOrder: nextSortOrder,
    });

    return NextResponse.json(
      { message: "Complaint type created successfully", complaintType },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Error creating complaint type:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "A complaint type with this name already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to create complaint type" },
      { status: 500 },
    );
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
