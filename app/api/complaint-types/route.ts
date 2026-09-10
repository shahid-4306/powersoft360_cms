import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ComplaintType from "@/models/ComplaintType";
import { ensureDefaultComplaintTypes } from "@/lib/complaintTypes";

// ======================================================
// GET → Public, read-only list of Active complaint types.
// Used by the "Register Online Complaint" form's Complaint Type
// dropdown. Inactive types are never returned here.
// ======================================================
export async function GET() {
  try {
    await dbConnect();
    await ensureDefaultComplaintTypes();

    const complaintTypes = await ComplaintType.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name description")
      .lean();

    return NextResponse.json(
      {
        complaintTypes: complaintTypes.map((t: any) => ({
          name: t.name,
          description: t.description || "",
        })),
      },
      { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
  } catch (error) {
    console.error("❌ Error fetching active complaint types:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint types", complaintTypes: [] },
      { status: 500 },
    );
  }
}
