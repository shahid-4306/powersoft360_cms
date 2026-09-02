import mongoose, { Schema, Document } from "mongoose";

// Software types are now managed dynamically by Administrators from
// Dashboard → Software Types (see models/SoftwareType.ts and
// lib/softwareTypes.ts) instead of this hardcoded list. Validation of
// `softwareType` happens at the API layer (app/api/company_information)
// against the active SoftwareType collection.
export const SOFTWARE_VERSIONS = ["v1.00", "v2.00", "v3.00"] as const;

export interface ISoftwareInfo {
  softwareType: string;
  version: (typeof SOFTWARE_VERSIONS)[number];
  lastUpdated: Date;
}

export interface ICompany extends Document {
  code: string;
  companyName: string;
  city: string;
  phoneNumber: string;
  address: string;
  support: "Active" | "In-Active";
  designatedDeveloper: string;
  companyRepresentative: string;
  softwareInformation: ISoftwareInfo[];
  createdAt: Date;
  createdBy: string;
}

const SoftwareInfoSchema: Schema = new Schema({
  softwareType: {
    type: String,
    required: true,
    trim: true,
  },
  version: {
    type: String,
    enum: SOFTWARE_VERSIONS,
    required: true,
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const CompanySchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    support: {
      type: String,
      enum: ["Active", "In-Active"],
      required: true,
      default: "Active",
    },
    designatedDeveloper: {
      type: String,
      default: "N/A",
    },
    companyRepresentative: {
      type: String,
      default: "N/A",
    },
    softwareInformation: [SoftwareInfoSchema],
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.CompanyInformation ||
  mongoose.model<ICompany>("CompanyInformation", CompanySchema);
