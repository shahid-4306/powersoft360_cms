import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyInformation from "@/models/CompanyInformation";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";
import { notifyCompanyCreated } from "@/lib/notification-events";

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

export async function GET(req: Request) {
  await connectDB;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const limitParam = searchParams.get("limit");

    // Parse limit, default to 10, max 1000
    let limit = 10;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 1000); // cap at 1000
      }
    }

    let query = {};

    if (search && search.length >= 2) {
      query = {
        companyName: { $regex: search, $options: "i" },
      };
    }

    const companies = await CompanyInformation.find(query).limit(limit).lean();

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await connectDB;
  try {
    const body = await req.json();

    const validationError = await validateSoftwareInformation(body?.softwareInformation);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const company = new CompanyInformation(body);
    const savedCompany = await company.save();

    // Notification: alert company-info managers (non-blocking)
    notifyCompanyCreated({
      companyId: String(savedCompany._id),
      companyName: savedCompany.companyName || body?.companyName || "New Company",
    });

    return NextResponse.json(savedCompany, { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 },
    );
  }
}
