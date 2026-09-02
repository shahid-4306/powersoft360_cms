import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SoftwareType from "@/models/SoftwareType";
import { ensureDefaultSoftwareTypes } from "@/lib/softwareTypes";

// ======================================================
// GET → Public, read-only list of Active software types.
// Used by every dropdown in the app (User Registration,
// Complaint Register, Company Information). Inactive types
// are never returned here.
// ======================================================
export async function GET() {
  try {
    await dbConnect();
    await ensureDefaultSoftwareTypes();

    const softwareTypes = await SoftwareType.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name description")
      .lean();

    return NextResponse.json(
      {
        softwareTypes: softwareTypes.map((t: any) => ({
          name: t.name,
          description: t.description || "",
        })),
      },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (error) {
    console.error("❌ Error fetching active software types:", error);
    return NextResponse.json(
      { error: "Failed to fetch software types", softwareTypes: [] },
      { status: 500 },
    );
  }
}
