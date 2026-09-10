import dbConnect from "@/lib/db";
import ComplaintType from "@/models/ComplaintType";

// ======================================================
// Default complaint categories seeded once, automatically, the first
// time the ComplaintType collection is queried and found empty — so
// the "Register Online Complaint" dropdown is never empty out of the
// box, even before an Administrator has created any custom types.
// ======================================================
const DEFAULT_COMPLAINT_TYPES: string[] = [
  "Software Issue",
  "Hardware Issue",
  "Network / Connectivity",
  "Data / Report Issue",
  "Training / Guidance Request",
  "Other",
];

let seedInFlight: Promise<void> | null = null;

/**
 * Idempotently seeds the ComplaintType collection with a small default
 * list the first time it's empty. Safe to call on every request — it's
 * a no-op once at least one document exists. Concurrent calls share a
 * single in-flight promise to avoid duplicate-insert races.
 */
export async function ensureDefaultComplaintTypes(): Promise<void> {
  if (seedInFlight) {
    await seedInFlight;
    return;
  }

  seedInFlight = (async () => {
    await dbConnect();
    const count = await ComplaintType.countDocuments({});
    if (count > 0) return;

    try {
      await ComplaintType.insertMany(
        DEFAULT_COMPLAINT_TYPES.map((name, index) => ({
          name,
          isActive: true,
          sortOrder: index,
        })),
        { ordered: false },
      );
    } catch (error) {
      // Ignore duplicate-key races from concurrent seeding attempts;
      // any other error is logged but never blocks the request.
      console.error("⚠️ ComplaintType seeding warning:", error);
    }
  })();

  await seedInFlight;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Case-insensitive check that `name` matches an Active complaint type.
 * Used to validate every complaint registration server-side, mirroring
 * isValidActiveSoftwareType in lib/softwareTypes.ts.
 */
export async function isValidActiveComplaintType(
  name: string,
): Promise<boolean> {
  if (!name || !name.trim()) return false;
  await dbConnect();
  await ensureDefaultComplaintTypes();

  const match = await ComplaintType.findOne({
    isActive: true,
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  }).lean();

  return !!match;
}
