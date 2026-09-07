import CompanyInformation from "@/models/CompanyInformation";

/**
 * Centralized company validation / duplicate-prevention helpers.
 *
 * Company ID (code) and Company Name are mandatory. City, Mobile Number
 * (phoneNumber) and Remarks are optional. The same company (matched by
 * Company ID OR Company Name, case-insensitively) must never be created
 * more than once — this is enforced here at the database/API level so it
 * applies consistently to manual creation, edits, and XLSX bulk import.
 */

export function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface CompanyLookupResult {
  _id: string;
  code: string;
  companyName: string;
}

/**
 * Finds an existing company whose code OR companyName matches the given
 * values, case-insensitively (exact match, not a substring search).
 * Optionally excludes a specific document id (used on update).
 */
export async function findDuplicateCompany(
  code: string,
  companyName: string,
  excludeId?: string,
): Promise<CompanyLookupResult | null> {
  const orConditions: any[] = [];

  if (code) {
    orConditions.push({
      code: { $regex: `^${escapeRegExp(code)}$`, $options: "i" },
    });
  }
  if (companyName) {
    orConditions.push({
      companyName: { $regex: `^${escapeRegExp(companyName)}$`, $options: "i" },
    });
  }

  if (orConditions.length === 0) return null;

  const query: any = { $or: orConditions };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await CompanyInformation.findOne(query).lean<any>();
  if (!existing) return null;

  return {
    _id: String(existing._id),
    code: existing.code,
    companyName: existing.companyName,
  };
}

export interface CompanyFieldValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the mandatory fields for a company record. Company ID (code)
 * and Company Name are required; City, Mobile Number, and Remarks stay
 * optional.
 */
export function validateMandatoryCompanyFields(input: {
  code?: unknown;
  companyName?: unknown;
}): CompanyFieldValidationResult {
  const code = normalizeText(input.code);
  const companyName = normalizeText(input.companyName);

  if (!code) {
    return { valid: false, error: "Company ID is required." };
  }
  if (!companyName) {
    return { valid: false, error: "Company Name is required." };
  }

  return { valid: true };
}
