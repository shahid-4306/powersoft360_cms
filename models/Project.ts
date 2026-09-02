import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProject extends Document {
  companyCode: string
  companyName: string
  city: string
  address: string
  projectName: string
  projectPath: string
  dbName: string
  dbLocation: string
  rProjectName: string
  rProjectPath: string
  createdAt: Date
  createdBy: string
}

const ProjectSchema: Schema = new Schema({
  companyCode: {
    type: String,
    required: [true, 'Company code is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    unique: true
  },
  projectPath: {
    type: String,
    required: [true, 'Project path is required'],
    trim: true
  },
  dbName: {
    type: String,
    trim: true,
    default: ''
  },
  dbLocation: {
    type: String,
    trim: true,
    default: ''
  },
  rProjectName: {
    type: String,
    trim: true,
    default: ''
  },
  rProjectPath: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true
  }
}, {
  timestamps: true
})

// Create index for better search performance
ProjectSchema.index({ companyCode: 1, projectName: 1 })
ProjectSchema.index({ projectName: 'text', companyName: 'text' })

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

export default Project