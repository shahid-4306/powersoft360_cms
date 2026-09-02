import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import OnlineComplaint from "@/models/OnlineComplaint"

// --------------------------------------------------------------------
// Requirement 1 — the customer-facing "Complaint Status" page needs the
// COMPLETE picture: original complaint details, admin/developer
// responses, actions taken, all remarks, current status, resolution
// timeline, and the full communication history — not just the bare
// summary this endpoint used to return. This formatter is the single
// place that shapes what a customer is allowed to see (no internal
// user IDs/usernames beyond display name, no other customers' data).
// --------------------------------------------------------------------
function formatComplaintForCustomer(complaint: any) {
  return {
    complaintNumber: complaint.complaintNumber,
    status: complaint.status,
    company: complaint.company,
    softwareType: complaint.softwareType,
    contactPerson: complaint.contactPerson,
    contactPhone: complaint.contactPhone,
    complaintRemarks: complaint.complaintRemarks,
    attachments: complaint.attachments || [],
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,

    // Assignment / admin action
    assignedTo: complaint.assignedTo
      ? { name: complaint.assignedTo.name, role: complaint.assignedTo.role }
      : null,
    assignedDate: complaint.assignedDate || null,
    assignmentRemarks: complaint.assignmentRemarks || "",

    // Resolution (developer) details
    developerStatus: complaint.developerStatus || "not-started",
    resolvedDate: complaint.resolvedDate || null,
    resolutionRemarks: complaint.resolutionRemarks || "",
    resolutionAttachments: complaint.resolutionAttachments || [],

    // Customer done/re-open lifecycle
    closedByUser: !!complaint.closedByUser,
    closedByUserAt: complaint.closedByUserAt || null,
    reopenCount: complaint.reopenCount || 0,
    lastReopenedAt: complaint.lastReopenedAt || null,
    lastReopenRemarks: complaint.lastReopenRemarks || "",

    // Admin completion approval (separate from the customer's own Done click)
    completionApproved: !!complaint.completionApproved,
    completionApprovedAt: complaint.completionApprovedAt || null,
    completionRemarks: complaint.completionRemarks || "",
    completionRejectionRemarks: complaint.completionRejectionRemarks || "",

    // Full chronological history for the transparency table
    history: (complaint.history || []).slice().sort(
      (a: any, b: any) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    ),
  }
}

export async function GET(request: Request) {
  await dbConnect()

  try {
    const { searchParams } = new URL(request.url)
    const complaintNumber = searchParams.get('complaintNumber')
    const email = searchParams.get('email')

    if (!complaintNumber && !email) {
      return NextResponse.json(
        { error: "Complaint number or email is required" },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // Lookup by verified email — returns all complaints
    // submitted by that email, most recent first. Used by
    // the "Complaint Status" flow reached from the
    // Complaint module after email verification.
    // --------------------------------------------------
    if (email && !complaintNumber) {
      const complaints = await OnlineComplaint.find({
        submitterEmail: email.toLowerCase().trim(),
      })
        .sort({ createdAt: -1 })
        .lean()

      const responseData = complaints.map((complaint: any) => formatComplaintForCustomer(complaint))

      return NextResponse.json({ complaints: responseData })
    }

    console.log("Searching for complaint:", complaintNumber)

    const complaint = await OnlineComplaint.findOne({ 
      complaintNumber: complaintNumber!.toUpperCase() 
    }).lean()

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found. Please check your complaint number." },
        { status: 404 }
      )
    }

    // Return formatted complaint data — full details (Requirement 1)
    const responseData = formatComplaintForCustomer(complaint)

    console.log("Complaint found:", responseData.complaintNumber)

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error("Error fetching complaint status:", error)
    return NextResponse.json(
      { error: "Failed to fetch complaint status" },
      { status: 500 }
    )
  }
}