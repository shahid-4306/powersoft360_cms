import OnlineComplaint from "@/models/OnlineComplaint";

export type ComplaintHistoryAction =
  | "created"
  | "assigned"
  | "resolved"
  | "closed_by_user"
  | "reopened_by_user"
  | "admin_closed"
  | "admin_rejected"
  | "note";

export interface ComplaintHistoryEntryInput {
  action: ComplaintHistoryAction;
  status?: string;
  by?: string;
  byRole?: "customer" | "admin" | "manager" | "developer" | "system";
  remarks?: string;
}

/**
 * Appends a history entry to the given complaint (by _id or complaintNumber).
 * Failures are logged but never thrown — history is supplementary and must
 * never block or fail the primary operation that called it.
 */
export async function pushComplaintHistory(
  complaintIdOrNumber: string,
  entry: ComplaintHistoryEntryInput,
): Promise<void> {
  try {
    const mongoose = (await import("mongoose")).default;
    const query = mongoose.Types.ObjectId.isValid(complaintIdOrNumber)
      ? { _id: complaintIdOrNumber }
      : { complaintNumber: complaintIdOrNumber };

    await OnlineComplaint.updateOne(query, {
      $push: {
        history: {
          ...entry,
          at: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("pushComplaintHistory failed (non-fatal):", error);
  }
}
