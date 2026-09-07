// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/db";
// import CompanyInformation from "@/models/CompanyInformation";
// import { isValidActiveSoftwareType } from "@/lib/softwareTypes";
// import { notifyCompanyCreated } from "@/lib/notification-events";

// // Connect to database once
// const connectDB = dbConnect();

// async function validateSoftwareInformation(
//   softwareInformation: Array<{ softwareType?: string }> | undefined,
// ): Promise<string | null> {
//   if (!Array.isArray(softwareInformation)) return null;

//   for (const entry of softwareInformation) {
//     const type = (entry?.softwareType || "").trim();
//     if (!type) continue;
//     if (!(await isValidActiveSoftwareType(type))) {
//       return `"${type}" is not an active software type. Please choose a currently active software type or ask an Administrator to activate it under Software Types.`;
//     }
//   }

//   return null;
// }

// export async function GET(req: Request) {
//   await connectDB;

//   try {
//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search")?.trim();
//     const limitParam = searchParams.get("limit");

//     // Parse limit, default to 10, max 1000
//     let limit = 10;
//     if (limitParam) {
//       const parsed = parseInt(limitParam, 10);
//       if (!isNaN(parsed) && parsed > 0) {
//         limit = Math.min(parsed, 1000); // cap at 1000
//       }
//     }

//     let query = {};

//     if (search && search.length >= 2) {
//       query = {
//         companyName: { $regex: search, $options: "i" },
//       };
//     }

//     const companies = await CompanyInformation.find(query).limit(limit).lean();

//     return NextResponse.json(companies, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching companies:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch companies" },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req: Request) {
//   await connectDB;
//   try {
//     const body = await req.json();

//     const validationError = await validateSoftwareInformation(body?.softwareInformation);
//     if (validationError) {
//       return NextResponse.json({ error: validationError }, { status: 400 });
//     }

//     const company = new CompanyInformation(body);
//     const savedCompany = await company.save();

//     // Notification: alert company-info managers (non-blocking)
//     notifyCompanyCreated({
//       companyId: String(savedCompany._id),
//       companyName: savedCompany.companyName || body?.companyName || "New Company",
//     });

//     return NextResponse.json(savedCompany, { status: 201 });
//   } catch (error: any) {
//     console.error("Error creating company:", error);
//     return NextResponse.json(
//       { error: "Failed to create company" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyInformation from "@/models/CompanyInformation";
import { isValidActiveSoftwareType } from "@/lib/softwareTypes";
import { notifyCompanyCreated } from "@/lib/notification-events";
import {
  findDuplicateCompany,
  normalizeText,
  validateMandatoryCompanyFields,
} from "@/lib/companyValidation";

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

    // Mandatory field validation: Company ID (code) and Company Name are
    // required. City, Mobile Number, and Remarks remain optional. This
    // applies to both the "Create New Company" form and any programmatic
    // caller (e.g. the customer-facing "add company" flow) hitting this
    // same endpoint.
    const fieldValidation = validateMandatoryCompanyFields(body);
    if (!fieldValidation.valid) {
      return NextResponse.json(
        { error: fieldValidation.error },
        { status: 400 },
      );
    }

    const code = normalizeText(body.code);
    const companyName = normalizeText(body.companyName);

    const validationError = await validateSoftwareInformation(
      body?.softwareInformation,
    );
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Duplicate prevention at the database/API level: the same company
    // (matched by Company ID OR Company Name, case-insensitively) can
    // never be registered more than once, regardless of how it is
    // created (manual form, XLSX import, or customer self-service add).
    const duplicate = await findDuplicateCompany(code, companyName);
    if (duplicate) {
      return NextResponse.json(
        {
          error: `A company with this ${
            duplicate.code.toLowerCase() === code.toLowerCase()
              ? "Company ID"
              : "Company Name"
          } already exists ("${duplicate.companyName}"). Duplicate companies are not allowed.`,
          duplicate: true,
          existingCompanyId: duplicate._id,
        },
        { status: 409 },
      );
    }

    const company = new CompanyInformation({
      ...body,
      code,
      companyName,
      city: normalizeText(body.city),
      phoneNumber: normalizeText(body.phoneNumber),
      remarks: normalizeText(body.remarks),
    });
    const savedCompany = await company.save();

    // Notification: alert company-info managers (non-blocking)
    notifyCompanyCreated({
      companyId: String(savedCompany._id),
      companyName:
        savedCompany.companyName || body?.companyName || "New Company",
    });

    return NextResponse.json(savedCompany, { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);

    // Friendly message for the rare race-condition duplicate key error
    // (unique index on `code`) instead of a generic 500.
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          error:
            "A company with this Company ID or Company Name already exists. Duplicate companies are not allowed.",
          duplicate: true,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to create company" },
      { status: 500 },
    );
  }
}
