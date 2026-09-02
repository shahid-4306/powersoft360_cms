// lib/gridfs-download.ts
import mongoose from 'mongoose';
import { getGridFS } from './gridfs';
import archiver from 'archiver';

export interface FileInfo {
  id: string;
  filename: string;
  contentType?: string;
  length?: number;
  metadata?: any;
}

export interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

/**
 * Get file information from GridFS
 */
export async function getGridFSFile(fileId: string): Promise<FileInfo | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return null;
    }

    const gfs = await getGridFS();
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('No database connection available');
    }

    const objId = new mongoose.Types.ObjectId(fileId);
    let fileDoc: any = null;

    try {
      if (typeof (gfs as any).find === 'function') {
        const files = await (gfs as any).find({ _id: objId }).toArray();
        fileDoc = files?.[0];
      } else {
        fileDoc = await db.collection('fs.files').findOne({ _id: objId });
      }
    } catch (err) {
      console.warn('Failed to lookup GridFS metadata:', err);
    }

    if (!fileDoc) return null;

    return {
      id: fileDoc._id.toString(),
      filename: fileDoc.filename || `file-${fileId}`,
      contentType: fileDoc.contentType,
      length: fileDoc.length,
      metadata: fileDoc.metadata
    };
  } catch (error) {
    console.error('Error getting GridFS file:', error);
    return null;
  }
}

/**
 * Download a single file from GridFS
 */
export async function downloadGridFSFile(fileId: string): Promise<DownloadResult | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return null;
    }

    const gfs = await getGridFS();
    const fileInfo = await getGridFSFile(fileId);
    
    if (!fileInfo) {
      return null;
    }

    const objId = new mongoose.Types.ObjectId(fileId);
    const downloadStream = (gfs as any).openDownloadStream
      ? (gfs as any).openDownloadStream(objId)
      : null;

    if (!downloadStream) {
      return null;
    }

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      downloadStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on('end', () => resolve());
      downloadStream.on('error', (err: any) => reject(err));
    });

    const buffer = Buffer.concat(chunks);

    return {
      buffer,
      contentType: fileInfo.contentType || 'application/octet-stream',
      filename: fileInfo.filename
    };
  } catch (error) {
    console.error('Error downloading GridFS file:', error);
    return null;
  }
}

/**
 * Download multiple files as ZIP
 */
export async function downloadMultipleAsZip(
  files: Array<{ id: string; filename: string }>
): Promise<Buffer | null> {
  try {
    const gfs = await getGridFS();
    const validFiles = files.filter(f => mongoose.Types.ObjectId.isValid(f.id));

    if (validFiles.length === 0) {
      return null;
    }

    // Import stream dynamically for Edge compatibility
    const { PassThrough } = await import('stream');
    const passThrough = new PassThrough();
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    archive.pipe(passThrough);

    // Download and add each file to the ZIP
    for (const file of validFiles) {
      try {
        const fileData = await downloadGridFSFile(file.id);
        if (fileData) {
          archive.append(fileData.buffer, { 
            name: file.filename || `file-${file.id}` 
          });
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.id}:`, fileError);
        continue;
      }
    }

    await archive.finalize();

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of passThrough) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error creating ZIP archive:', error);
    return null;
  }
}

/**
 * Get file list with details
 */
export async function getGridFSFileList(fileIds: string[]): Promise<FileInfo[]> {
  const fileInfos: FileInfo[] = [];
  
  for (const fileId of fileIds) {
    if (mongoose.Types.ObjectId.isValid(fileId)) {
      const fileInfo = await getGridFSFile(fileId);
      if (fileInfo) {
        fileInfos.push(fileInfo);
      }
    }
  }
  
  return fileInfos;
}