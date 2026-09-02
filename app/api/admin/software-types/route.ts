import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SoftwareType from "@/models/SoftwareType";
import { verifySessionCookie } from "@/lib/auth";
import { ensureDefaultSoftwareTypes } from "@/lib/softwareTypes";

// ======================================================
// GET → List every software type (Active + Inactive) for the
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
    await ensureDefaultSoftwareTypes();

    const softwareTypes = await SoftwareType.find({})
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const counts = {
      total: softwareTypes.length,
      active: softwareTypes.filter((t: any) => t.isActive).length,
      inactive: softwareTypes.filter((t: any) => !t.isActive).length,
    };

    return NextResponse.json({ softwareTypes, counts });
  } catch (error: any) {
    console.error("❌ Error fetching software types:", error);
    return NextResponse.json(
      { message: "Failed to fetch software types" },
      { status: 500 },
    );
  }
}

// ======================================================
// POST → Create a new software type.
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
        { message: "Software type name is required" },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Software type name must not exceed 100 characters" },
        { status: 400 },
      );
    }

    // Case-insensitive duplicate check (Mongo's unique index is case-sensitive)
    const existing = await SoftwareType.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    }).lean();

    if (existing) {
      return NextResponse.json(
        { message: `A software type named "${name}" already exists.` },
        { status: 409 },
      );
    }

    const lastByOrder = await SoftwareType.findOne({})
      .sort({ sortOrder: -1 })
      .select("sortOrder")
      .lean();
    const nextSortOrder =
      lastByOrder && typeof (lastByOrder as any).sortOrder === "number"
        ? (lastByOrder as any).sortOrder + 1
        : 0;

    const softwareType = await SoftwareType.create({
      name,
      description,
      isActive,
      sortOrder: nextSortOrder,
    });

    return NextResponse.json(
      { message: "Software type created successfully", softwareType },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Error creating software type:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "A software type with this name already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to create software type" },
      { status: 500 },
    );
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
