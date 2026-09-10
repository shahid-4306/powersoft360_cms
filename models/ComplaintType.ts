import mongoose, { Schema, Document, Model } from "mongoose";

// ======================================================
// ComplaintType — the catalog of complaint categories an
// Administrator manages from Dashboard → Complaint Types.
// Mirrors the existing SoftwareType pattern (see
// models/SoftwareType.ts) so validation, seeding, and admin
// CRUD behave identically and predictably.
// ======================================================
export interface IComplaintType extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Complaint type name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Complaint type name must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "complaint_types", // Explicit collection name to avoid collisions
  },
);

// Case-insensitive uniqueness is enforced at the application layer (see
// lib/complaintTypes.ts) since Mongo's unique index is case-sensitive.
ComplaintTypeSchema.index({ isActive: 1, sortOrder: 1, name: 1 });

const ComplaintType: Model<IComplaintType> =
  mongoose.models.ComplaintType ||
  mongoose.model<IComplaintType>("ComplaintType", ComplaintTypeSchema);

export default ComplaintType;
