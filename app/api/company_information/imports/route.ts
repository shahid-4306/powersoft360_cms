import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import dbConnect from "@/lib/db";
import CompanyInformation from "@/models/CompanyInformation";
import { notifyCompanyCreated } from "@/lib/notification-events";
import { escapeRegExp, normalizeText } from "@/lib/companyValidation";

// Connect to database once
const connectDB = dbConnect();

// Accepted column header aliases (case/space/underscore insensitive) mapped
// to the internal field names. Company ID -> code, Company Name ->
// companyName are mandatory; City, Mobile Number -> phoneNumber, and
// Remarks stay optional, per the required XLSX import behaviour.
const HEADER_ALIASES: Record<string, string> = {
  companyid: "code",
  id: "code",
  code: "code",
  companycode: "code",

  companyname: "companyName",
  name: "companyName",

  city: "city",

  mobilenumber: "phoneNumber",
  mobile: "phoneNumber",
  phonenumber: "phoneNumber",
  phone: "phoneNumber",
  contactnumber: "phoneNumber",

  remarks: "remarks",
  remark: "remarks",
  notes: "remarks",
};

function normalizeHeader(header: string): string {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]/g, "");
}

function mapRow(row: Record<string, unknown>): {
  code: string;
  companyName: string;
  city: string;
  phoneNumber: string;
  remarks: string;
} {
  const mapped: Record<string, string> = {
    code: "",
    companyName: "",
    city: "",
    phoneNumber: "",
    remarks: "",
  };

  for (const [rawHeader, rawValue] of Object.entries(row)) {
    const normalizedHeader = normalizeHeader(rawHeader);
    const field = HEADER_ALIASES[normalizedHeader];
    if (!field) continue;

    const value =
      rawValue === null || rawValue === undefined
        ? ""
        : String(rawValue).trim();

    // Don't let a later, less-specific alias overwrite an already-mapped
    // non-empty value (e.g. both "Phone" and "Mobile Number" columns).
    if (!mapped[field]) {
      mapped[field] = value;
    }
  }

  return mapped as any;
}

interface ImportRowResult {
  row: number;
  code?: string;
  companyName?: string;
  status: "inserted" | "updated" | "skipped_duplicate_in_file" | "error";
  message?: string;
}

export async function POST(req: Request) {
  await connectDB;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No XLSX file was provided." },
        { status: 400 },
      );
    }

    const allowedExtensions = [".xlsx", ".xls"];
    const fileName = (file.name || "").toLowerCase();
    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an XLSX (or XLS) file." },
        { status: 400 },
      );
    }

    // 10MB cap, consistent with the rest of the app's file-size limits.
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not read the XLSX file. Please make sure it is a valid Excel file.",
        },
        { status: 400 },
      );
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: "The XLSX file does not contain any sheets." },
        { status: 400 },
      );
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: "The XLSX file has no data rows to import." },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // Pass 1: validate + de-duplicate WITHIN the file. If the same
    // Company ID or Company Name appears more than once in the sheet,
    // it is treated as one company — later rows fill in any optional
    // fields (City / Mobile Number / Remarks) still blank on the first
    // occurrence, rather than creating a second record.
    // ------------------------------------------------------------------
    type Group = {
      code: string;
      companyName: string;
      city: string;
      phoneNumber: string;
      remarks: string;
      firstRow: number;
    };

    const groups: Group[] = [];
    const results: ImportRowResult[] = [];

    const findGroupIndex = (code: string, companyName: string): number =>
      groups.findIndex(
        (g) =>
          (code && g.code.toLowerCase() === code.toLowerCase()) ||
          (companyName &&
            g.companyName.toLowerCase() === companyName.toLowerCase()),
      );

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2; // header is row 1
      const { code, companyName, city, phoneNumber, remarks } = mapRow(rawRow);

      // Skip fully blank rows silently (common at the end of a sheet).
      const isEmptyRow =
        !code && !companyName && !city && !phoneNumber && !remarks;
      if (isEmptyRow) return;

      if (!code || !companyName) {
        results.push({
          row: rowNumber,
          code: code || undefined,
          companyName: companyName || undefined,
          status: "error",
          message:
            !code && !companyName
              ? "Company ID and Company Name are required."
              : !code
                ? "Company ID is required."
                : "Company Name is required.",
        });
        return;
      }

      const existingIndex = findGroupIndex(code, companyName);
      if (existingIndex >= 0) {
        const existing = groups[existingIndex];
        existing.city = existing.city || city;
        existing.phoneNumber = existing.phoneNumber || phoneNumber;
        existing.remarks = existing.remarks || remarks;
        results.push({
          row: rowNumber,
          code,
          companyName,
          status: "skipped_duplicate_in_file",
          message: `Duplicate of the company first seen at row ${existing.firstRow} in this file — merged, no extra record created.`,
        });
        return;
      }

      groups.push({
        code,
        companyName,
        city,
        phoneNumber,
        remarks,
        firstRow: rowNumber,
      });
      // Placeholder result; replaced with the real outcome in Pass 2.
      results.push({ row: rowNumber, code, companyName, status: "inserted" });
    });

    // ------------------------------------------------------------------
    // Pass 2: for each de-duplicated group, check the database. If the
    // company already exists (matched by Company ID OR Company Name,
    // case-insensitively), merge in any optional fields it's still
    // missing instead of creating a duplicate record. Otherwise, insert
    // a new company.
    // ------------------------------------------------------------------
    let inserted = 0;
    let updated = 0;
    const createdCompanies: { id: string; companyName: string }[] = [];

    for (const group of groups) {
      const resultEntry = results.find(
        (r) => r.row === group.firstRow && r.status === "inserted",
      );

      try {
        const existing = await CompanyInformation.findOne({
          $or: [
            {
              code: { $regex: `^${escapeRegExp(group.code)}$`, $options: "i" },
            },
            {
              companyName: {
                $regex: `^${escapeRegExp(group.companyName)}$`,
                $options: "i",
              },
            },
          ],
        });

        if (existing) {
          const updates: Record<string, string> = {};
          if (!normalizeText(existing.city) && group.city)
            updates.city = group.city;
          if (!normalizeText(existing.phoneNumber) && group.phoneNumber)
            updates.phoneNumber = group.phoneNumber;
          if (!normalizeText(existing.remarks) && group.remarks)
            updates.remarks = group.remarks;

          if (Object.keys(updates).length > 0) {
            await CompanyInformation.updateOne(
              { _id: existing._id },
              { $set: updates },
            );
          }

          updated += 1;
          if (resultEntry) {
            resultEntry.status = "updated";
            resultEntry.message =
              "Company already existed — matched and kept as one record.";
          }
          continue;
        }

        const created = await CompanyInformation.create({
          code: group.code,
          companyName: group.companyName,
          city: group.city,
          phoneNumber: group.phoneNumber,
          remarks: group.remarks,
          address: "",
          support: "Active",
          designatedDeveloper: "N/A",
          companyRepresentative: "N/A",
          softwareInformation: [],
          createdBy: "xlsx-import",
        });

        inserted += 1;
        createdCompanies.push({
          id: String(created._id),
          companyName: created.companyName,
        });
        if (resultEntry) {
          resultEntry.status = "inserted";
          resultEntry.message = "New company created.";
        }
      } catch (err: any) {
        if (resultEntry) {
          resultEntry.status = "error";
          resultEntry.message =
            err?.code === 11000
              ? "Duplicate company (Company ID or Company Name already exists)."
              : err?.message || "Failed to save this company.";
        }
      }
    }

    // Notify company-info managers (non-blocking), once per newly
    // created company, reusing the existing notification event.
    for (const c of createdCompanies) {
      notifyCompanyCreated({ companyId: c.id, companyName: c.companyName });
    }

    const errorCount = results.filter((r) => r.status === "error").length;
    const skippedDuplicateCount = results.filter(
      (r) => r.status === "skipped_duplicate_in_file",
    ).length;

    return NextResponse.json(
      {
        success: true,
        message: `Import complete: ${inserted} company(ies) created, ${updated} matched to existing companies, ${skippedDuplicateCount} duplicate row(s) merged, ${errorCount} row(s) had errors.`,
        summary: {
          totalRows: rawRows.length,
          inserted,
          updated,
          skippedDuplicateInFile: skippedDuplicateCount,
          errors: errorCount,
        },
        results,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error importing companies from XLSX:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "Failed to import companies from the XLSX file.",
      },
      { status: 500 },
    );
  }
}
