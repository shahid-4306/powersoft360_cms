import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyInformation from "@/models/CompanyInformation";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";

// Connect to database once
const connectDB = dbConnect();

async function validateSoftwareInformation(
  softwareInformation: Array<{ softwareType?: string }> | undefined,
): Promise<string | null> {
  if (!Array.isArray(softwareInformation)) return null;

  for (const entry of softwareInformation) {
    const type = (entry?.softwareType || "").trim();
    if (!type) continue;
    if (!(await isValidActiveSoftwareType(type))) {
      return `"${type}" is not an active software type. Please choose a currently active software type or ask an Administrator to activate it under Software Types.`;
    }
  }

  return null;
}

// Next.js 15: params is now a Promise
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB;

  try {
    const body = await req.json();

    const validationError = await validateSoftwareInformation(body?.softwareInformation);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updatedCompany = await CompanyInformation.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await connectDB;

  try {
    const deletedCompany = await CompanyInformation.findByIdAndDelete(id);

    if (!deletedCompany) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { message: "Failed to delete company" },
      { status: 500 },
    );
  }
}
