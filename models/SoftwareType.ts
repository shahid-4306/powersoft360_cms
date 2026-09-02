// import mongoose, { Schema, Document, Model } from "mongoose";

// export interface ISoftwareType extends Document {
//   name: string;
//   description?: string;
//   isActive: boolean;
//   sortOrder: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const SoftwareTypeSchema: Schema = new Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Software type name is required"],
//       trim: true,
//       unique: true,
//       maxlength: [100, "Software type name must not exceed 100 characters"],
//     },
//     description: {
//       type: String,
//       trim: true,
//       maxlength: [500, "Description must not exceed 500 characters"],
//       default: "",
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//     sortOrder: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true },
// );

// // Case-insensitive uniqueness is enforced at the application layer (see
// // lib/softwareTypes.ts) since Mongo's unique index is case-sensitive.
// SoftwareTypeSchema.index({ isActive: 1, sortOrder: 1, name: 1 });

// const SoftwareType: Model<ISoftwareType> =
//   mongoose.models.SoftwareType ||
//   mongoose.model<ISoftwareType>("SoftwareType", SoftwareTypeSchema);

// export default SoftwareType;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISoftwareType extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SoftwareTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Software type name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Software type name must not exceed 100 characters"],
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
    collection: "software_types", // Explicit collection name to avoid collection mismatches
  },
);

SoftwareTypeSchema.index({ isActive: 1, sortOrder: 1, name: 1 });

const SoftwareType: Model<ISoftwareType> =
  mongoose.models.SoftwareType ||
  mongoose.model<ISoftwareType>("SoftwareType", SoftwareTypeSchema);

export default SoftwareType;
