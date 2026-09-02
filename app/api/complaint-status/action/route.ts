// app/api/complaint-status/action/route.ts
//
// Requirement 1 — Complete Complaint Resolution Workflow.
//
// Lets a verified customer (customer_token cookie) act on their OWN
// resolved complaint from the "Complaint Status" page:
//
//   action = "done"    -> permanently mark it Closed and Complete.
//   action = "reopen"  -> mandatory remarks; sent back to the
//                         administrator with a "registered" (pending)
//                         status, preserving all prior history.
//
// Both actions are only allowed while status === "resolved", and only
// for the complaint's own submitterEmail, so this cannot be used to
// tamper with someone else's complaint or to skip the normal workflow.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  verifyCustomerSessionToken,
} from "@/lib/customer-auth";
import { pushComplaintHistory } from "@/lib/complaint-history";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME);

    if (!tokenCookie?.value) {
      return NextResponse.json(
        { error: "You must verify your email before you can update a complaint." },
        { status: 401 },
      );
    }

    let email: string;
    try {
      email = verifyCustomerSessionToken(tokenCookie.value).email.toLowerCase().trim();
    } catch {
      return NextResponse.json(
        { error: "Your session has expired. Please verify your email again." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { complaintNumber, action, remarks } = body as {
      complaintNumber?: string;
      action?: "done" | "reopen";
      remarks?: string;
    };

    if (!complaintNumber || !action || !["done", "reopen"].includes(action)) {
      return NextResponse.json(
        { error: "complaintNumber and a valid action ('done' or 'reopen') are required" },
        { status: 400 },
      );
    }

    if (action === "reopen" && !remarks?.trim()) {
      return NextResponse.json(
        { error: "Remarks are required to re-open a complaint" },
        { status: 400 },
      );
    }

    const complaint = await OnlineComplaint.findOne({
      complaintNumber: complaintNumber.toUpperCase(),
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    if ((complaint.submitterEmail || "").toLowerCase().trim() !== email) {
      return NextResponse.json(
        { error: "This complaint does not belong to your verified email" },
        { status: 403 },
      );
    }

    if (complaint.status !== "resolved") {
      return NextResponse.json(
        {
          error: `This action is only available once a complaint is resolved. Current status: ${complaint.status}`,
        },
        { status: 400 },
      );
    }

    if (action === "done") {
      complaint.status = "closed";
      complaint.closedByUser = true;
      complaint.closedByUserAt = new Date();
      await complaint.save();

      pushComplaintHistory(String(complaint._id), {
        action: "closed_by_user",
        status: "closed",
        by: email,
        byRole: "customer",
        remarks: "Customer confirmed the resolution and closed the complaint.",
      });

      return NextResponse.json({
        success: true,
        message: "Complaint marked as Closed and Complete. Thank you for confirming!",
        status: "closed",
      });
    }

    // action === "reopen"
    complaint.status = "registered";
    complaint.developerStatus = "pending";
    complaint.reopenCount = (complaint.reopenCount || 0) + 1;
    complaint.lastReopenedAt = new Date();
    complaint.lastReopenRemarks = remarks!.trim();
    await complaint.save();

    pushComplaintHistory(String(complaint._id), {
      action: "reopened_by_user",
      status: "registered",
      by: email,
      byRole: "customer",
      remarks: remarks!.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Your complaint has been sent back to the administrator for further review.",
      status: "registered",
    });
  } catch (error: any) {
    console.error("Error processing complaint action:", error);
    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 },
    );
  }
}
