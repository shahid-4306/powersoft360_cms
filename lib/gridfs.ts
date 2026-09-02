import { GridFSBucket, Db, MongoClient } from 'mongodb'
import mongoose from 'mongoose'

export interface GridFSFileWithMetadata extends mongoose.mongo.GridFSFile {
  metadata?: {
    originalName?: string
    uploadedAt?: Date
    taskCode?: string
    taskId?: string
    attachmentType?: string
    contentType?: string
  }
}

interface GridFSBucketWriteStreamOptions {
  chunkSizeBytes?: number
  metadata?: any
  contentType?: string
}

// Extend the GridFSBucket to support contentType
interface ExtendedGridFSBucket extends GridFSBucket {
  openUploadStream(
    filename: string, 
    options?: GridFSBucketWriteStreamOptions & { contentType?: string }
  ): mongoose.mongo.GridFSBucketWriteStream
}

let gfs: ExtendedGridFSBucket

export async function getGridFS(): Promise<ExtendedGridFSBucket> {
  if (gfs) {
    return gfs
  }

  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Database not connected')
  }

  gfs = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'uploads'
  }) as ExtendedGridFSBucket

  return gfs
}

export interface GridFSFileWithMetadata extends mongoose.mongo.GridFSFile {
  metadata?: {
    originalName?: string
    uploadedAt?: Date
    taskCode?: string
    taskId?: string
    attachmentType?: string
    contentType?: string
  }
}