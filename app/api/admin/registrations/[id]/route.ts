import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import UserRegister from "@/models/UserRegister";
import { verifySessionCookie } from "@/lib/auth";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/admin-email";
import { notifyRegistrationDecision } from "@/lib/notification-events";

type RouteParams = { params: Promise<{ id: string }> };

// ======================================================
// GET → Fetch a single registration's full details
// ======================================================
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid registration id" }, { status: 400 });
    }

    await dbConnect();
    const registration = await UserRegister.findById(id).select("-password").lean();

    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ registration });
  } catch (error: any) {
    console.error("❌ Error fetching registration:", error);
    return NextResponse.json(
      { message: "Failed to fetch registration", error: error.message },
      { status: 500 },
    );
  }
}

// ======================================================
// PATCH → Approve or reject a registration
// Body: { action: "approve" | "reject", reason?: string }
// ======================================================
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  let actorSession: { sub: string; username: string } | null = null;
  try {
    actorSession = await verifySessionCookie(req);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid registration id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { message: "action must be either 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    await dbConnect();

    const registration = await UserRegister.findById(id);
    if (!registration) {
      return NextResponse.json({ message: "Registration not found" }, { status: 404 });
    }

    if (registration.status !== "pending") {
      return NextResponse.json(
        {
          message: `This registration has already been ${registration.status}.`,
        },
        { status: 409 },
      );
    }

    if (action === "approve") {
      registration.status = "approved";
      registration.approvedAt = new Date();
      registration.rejectedAt = null;
      registration.rejectionReason = null;
      await registration.save();

      // Fire-and-log the approval email — a failed email should not roll
      // back the approval (the account is already active in our system).
      const emailResult = await sendApprovalEmail(
        registration.email,
        registration.fullName,
        registration.email,
      );

      // Notification: alert other reviewers of the decision (awaited so it
      // isn't dropped if the serverless function freezes right after the
      // response is returned).
      await notifyRegistrationDecision({
        registrationId: registration._id.toString(),
        applicantName: registration.fullName,
        decision: "approved",
        actor: actorSession ? { id: actorSession.sub, username: actorSession.username } : undefined,
      });

      return NextResponse.json({
        message: "Registration approved. The user can now access the Complaint module by verifying their email.",
        emailSent: !!emailResult?.success,
        registration: {
          id: registration._id.toString(),
          status: registration.status,
          approvedAt: registration.approvedAt,
        },
      });
    }

    // action === "reject"
    registration.status = "rejected";
    registration.rejectedAt = new Date();
    registration.rejectionReason =
      reason || "Your registration does not meet our current requirements.";
    await registration.save();

    const emailResult = await sendRejectionEmail(
      registration.email,
      registration.fullName,
      registration.rejectionReason as string,
    );

    // Notification: alert other reviewers of the decision (awaited so it
    // isn't dropped if the serverless function freezes right after the
    // response is returned).
    await notifyRegistrationDecision({
      registrationId: registration._id.toString(),
      applicantName: registration.fullName,
      decision: "rejected",
      actor: actorSession ? { id: actorSession.sub, username: actorSession.username } : undefined,
    });

    return NextResponse.json({
      message: "Registration rejected.",
      emailSent: !!emailResult?.success,
      registration: {
        id: registration._id.toString(),
        status: registration.status,
        rejectedAt: registration.rejectedAt,
        rejectionReason: registration.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error("❌ Error updating registration:", error);
    return NextResponse.json(
      { message: "Failed to update registration", error: error.message },
      { status: 500 },
    );
  }
}
