// models/UserRegister.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserRegister extends Document {
  fullName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  companyName: string;
  softwareType: string;
  description: string;
  profileImage?: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  // ---- Email OTP verification (added) ----
  // Registrations must prove ownership of the submitted email address via a
  // 6-digit OTP before they become visible to admins for approval. This does
  // NOT replace the existing admin-approval workflow — it gates entry to it.
  isEmailVerified: boolean;
  emailOtpHash?: string | null;
  emailOtpExpiresAt?: Date | null;
  emailOtpAttempts: number;
  emailOtpLastSentAt?: Date | null;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserRegisterSchema = new Schema<IUserRegister>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    // companyName / softwareType may contain a single value or a
    // comma-separated list of multiple values (multi-company /
    // multi-software registration). Stored as a plain string to stay
    // backward compatible with existing single-value records and every
    // reader that already does `.split(",")` on these fields.
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    softwareType: {
      type: String,
      required: [true, "Software type is required"],
      trim: true,
      // Validated at the API layer against the active SoftwareType
      // collection (see lib/softwareTypes.ts) rather than a hardcoded
      // enum, so Administrators can manage the list from the dashboard
      // without code changes.
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profileImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    // ---- Email OTP verification (added) ----
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailOtpHash: {
      type: String,
      default: null,
      select: false, // never returned by default queries
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    emailOtpLastSentAt: {
      type: Date,
      default: null,
      select: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// NOTE: This model intentionally uses a DIFFERENT model/collection name
// ("UserRegister") than the internal staff/admin model ("User" in
// models/User.ts). Registering both under the name "User" previously
// caused mongoose OverwriteModelError / silently-wrong-schema bugs and
// crashed the app on first import, since this file also referenced an
// undefined `UserRegister` identifier at export time.
const UserRegister: Model<IUserRegister> =
  mongoose.models.UserRegister ||
  mongoose.model<IUserRegister>("UserRegister", UserRegisterSchema);

export default UserRegister;
