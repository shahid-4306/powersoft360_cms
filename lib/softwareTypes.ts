import dbConnect from "@/lib/db";
import SoftwareType from "@/models/SoftwareType";

// ======================================================
// The product catalog that used to be hardcoded across the app
// (models/CompanyInformation.ts, models/Task.ts,
// app/api/tasks/[id]/route.ts, models/OnlineComplaint.ts). Seeded once,
// automatically, the first time the SoftwareType collection is queried
// and found empty — so every existing company, task, complaint, and
// registration that already references one of these names keeps working
// without any manual setup after this feature ships.
// ======================================================
const LEGACY_DEFAULT_SOFTWARE_TYPES: string[] = [
  "Finance Manager",
  "Finance Controller",
  "Power Accounting",
  "Ems Finance Manager Urdu",
  "Employee Management System",
  "Finance Manager FBR",
  "Finance Manager POS",
  "Power Rice",
  "Power DashBoard",
];

let seedInFlight: Promise<void> | null = null;

/**
 * Idempotently seeds the SoftwareType collection with the legacy product
 * list the first time it's empty. Safe to call on every request — it's a
 * no-op once at least one document exists. Concurrent calls share a single
 * in-flight promise to avoid duplicate-insert races.
 */
export async function ensureDefaultSoftwareTypes(): Promise<void> {
  if (seedInFlight) {
    await seedInFlight;
    return;
  }

  seedInFlight = (async () => {
    await dbConnect();
    const count = await SoftwareType.countDocuments({});
    if (count > 0) return;

    try {
      await SoftwareType.insertMany(
        LEGACY_DEFAULT_SOFTWARE_TYPES.map((name, index) => ({
          name,
          isActive: true,
          sortOrder: index,
        })),
        { ordered: false },
      );
    } catch (error) {
      // A concurrent request may have seeded first; duplicate key errors
      // here are expected and harmless.
      console.warn("Software type seeding skipped/partial:", error);
    }
  })();

  try {
    await seedInFlight;
  } finally {
    seedInFlight = null;
  }
}

/**
 * Returns the names of all Active software types, sorted for display.
 * Auto-seeds the legacy catalog first if the collection is empty.
 */
export async function getActiveSoftwareTypeNames(): Promise<string[]> {
  await dbConnect();
  await ensureDefaultSoftwareTypes();

  const types = await SoftwareType.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select("name")
    .lean();

  return types.map((t: any) => t.name);
}

/**
 * Validates that `name` is an Active software type. Case-insensitive
 * match, since older records may have inconsistent casing.
 */
export async function isValidActiveSoftwareType(name: string): Promise<boolean> {
  if (!name || typeof name !== "string") return false;

  await dbConnect();
  await ensureDefaultSoftwareTypes();

  const match = await SoftwareType.findOne({
    isActive: true,
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  }).lean();

  return !!match;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
