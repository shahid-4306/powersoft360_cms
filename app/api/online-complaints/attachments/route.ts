import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OnlineComplaint from "@/models/OnlineComplaint";
import { getGridFS } from "@/lib/gridfs";
import mongoose from "mongoose";
import archiver from "archiver";

/**
 * GET - Download complaint attachments
 */
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const complaintId = searchParams.get("complaintId");
    const fileId = searchParams.get("fileId");
    const download = searchParams.get("download");
    const type = searchParams.get("type") || "complaint"; // 'complaint' or 'assignment'

    // If fileId is provided, download that single file
    if (fileId) {
      return await downloadSingleFile(fileId);
    }

    // If download=zip is provided, create ZIP archive
    if (complaintId && download === "zip") {
      return await downloadAsZip(complaintId, type);
    }

    // If only complaintId is provided, return file list
    if (complaintId) {
      return await getFileList(complaintId, type);
    }

    return NextResponse.json({ message: "complaintId is required" }, { status: 400 });
  } catch (error: any) {
    console.error("Error handling complaint file download:", error);
    return NextResponse.json({ message: "Failed to handle file download", error: error?.message ?? String(error) }, { status: 500 });
  }
}

/**
 * Download a single file by GridFS ID
 */
async function downloadSingleFile(fileId: string) {
  try {
    const gfs = await getGridFS();
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ message: "Invalid file ID" }, { status: 400 });
    }

    const objId = new mongoose.Types.ObjectId(fileId);
    let fileDoc: any = null;

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("No mongoose DB connection available");
    }

    try {
      if (typeof (gfs as any).find === "function") {
        const files = await (gfs as any).find({ _id: objId }).toArray();
        fileDoc = files && files.length > 0 ? files[0] : null;
      } else {
        const files = await db.collection("fs.files").find({ _id: objId }).toArray();
        fileDoc = files && files.length > 0 ? files[0] : null;
      }
    } catch (err) {
      console.warn("Failed to lookup GridFS metadata:", err);
    }

    if (!fileDoc) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    const downloadStream = (gfs as any).openDownloadStream
      ? (gfs as any).openDownloadStream(objId)
      : null;

    if (!downloadStream) {
      return NextResponse.json({ message: "File stream not available" }, { status: 500 });
    }

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on("end", () => resolve());
      downloadStream.on("error", (err: any) => reject(err));
    });

    const fileBuffer = Buffer.concat(chunks);
    const fileName = fileDoc.filename || `file-${fileId}`;

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": fileDoc.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading single file:", error);
    return NextResponse.json({ message: "Failed to download file" }, { status: 500 });
  }
}

/**
 * Download all attachments as ZIP
 */
async function downloadAsZip(complaintId: string, type: string = "complaint") {
  console.log('=== ZIP DOWNLOAD START ===');
  console.log('Type:', type, 'complaintId:', complaintId);
  
  try {
    // Build query based on whether complaintId is a valid ObjectId
    const query = mongoose.Types.ObjectId.isValid(complaintId) 
      ? { _id: complaintId }
      : { complaintNumber: complaintId };
    
    console.log('Searching complaint with query:', JSON.stringify(query));

    const complaint = await OnlineComplaint.findOne(query).lean();
    if (!complaint) {
      console.log('❌ Complaint not found with query:', query);
      return NextResponse.json({ 
        message: "Complaint not found", 
        details: `No complaint found with ${mongoose.Types.ObjectId.isValid(complaintId) ? '_id' : 'complaintNumber'}: ${complaintId}`
      }, { status: 404 });
    }

    console.log('✅ Complaint found:', {
      _id: complaint._id,
      complaintNumber: complaint.complaintNumber
    });

    // Get attachments based on type
    let attachments: any[] = [];
    let typeLabel = "";
    
    if (type === "assignment") {
      attachments = Array.isArray(complaint.assignmentAttachments) ? complaint.assignmentAttachments : [];
      typeLabel = "assignment";
      console.log(`Found ${attachments.length} assignment attachments`);
    } else {
      attachments = Array.isArray(complaint.attachments) ? complaint.attachments : [];
      typeLabel = "complaint";
      console.log(`Found ${attachments.length} complaint attachments`);
    }
    
    // Handle legacy field name
    if (attachments.length === 0 && type === "complaint" && Array.isArray(complaint.complaintAttachments)) {
      attachments = complaint.complaintAttachments;
      console.log(`Found ${attachments.length} attachments in 'complaintAttachments' field`);
    }
    
    if (attachments.length === 0) {
      console.log(`❌ No ${typeLabel} attachments available for this complaint`);
      return NextResponse.json({ 
        message: `No ${typeLabel} attachments available`,
        complaintNumber: complaint.complaintNumber,
        type: typeLabel
      }, { status: 404 });
    }

    console.log(`Processing ${attachments.length} ${typeLabel} attachments:`);
    attachments.forEach((att, idx) => {
      console.log(`  ${idx + 1}. ${att.fileName} (ID: ${att.fileId})`);
    });

    const gfs = await getGridFS();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("No database connection available");
    }

    console.log('Creating ZIP archive...');
    
    // Create streams for ZIP
    const { PassThrough } = await import('stream');
    const passThrough = new PassThrough();
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('❌ Archive error:', err);
      throw err;
    });

    archive.on('warning', (err) => {
      console.warn('⚠️ Archive warning:', err);
    });

    // Pipe archive output to passThrough stream
    archive.pipe(passThrough);

    // Collect all file processing promises
    const fileProcessingPromises: Array<Promise<{ success: boolean; fileName?: string; error?: string }>> = [];

    for (const attachment of attachments) {
      const processPromise = new Promise<{ success: boolean; fileName?: string; error?: string }>(async (resolve) => {
        try {
          const fileId = attachment.fileId;
          const fileName = attachment.fileName || `file-${fileId}`;
          
          console.log(`Processing file: ${fileName} (${fileId})`);

          // Validate fileId
          if (!mongoose.Types.ObjectId.isValid(fileId)) {
            console.warn(`Invalid fileId format: ${fileId}`);
            resolve({ success: false, fileName, error: 'Invalid file ID format' });
            return;
          }

          const objId = new mongoose.Types.ObjectId(fileId);
          
          // Try to find file metadata in GridFS
          let fileDoc: any = null;
          try {
            // Try different ways to find the file
            const db = mongoose.connection.db;
            if (db) {
              const filesCollection = db.collection('fs.files');
              fileDoc = await filesCollection.findOne({ _id: objId });
            }
            
            if (!fileDoc && typeof (gfs as any).find === "function") {
              const files = await (gfs as any).find({ _id: objId }).toArray();
              fileDoc = files && files.length > 0 ? files[0] : null;
            }
          } catch (findError) {
            console.error(`Error finding file ${fileId}:`, findError);
          }

          if (!fileDoc) {
            console.warn(`File not found in GridFS: ${fileId}`);
            resolve({ success: false, fileName, error: 'File not found in GridFS' });
            return;
          }

          console.log(`File found in GridFS: ${fileDoc.filename || fileName} (${fileDoc.length} bytes)`);

          // Create download stream
          let downloadStream: any = null;
          if ((gfs as any).openDownloadStream) {
            downloadStream = (gfs as any).openDownloadStream(objId);
          } else if ((gfs as any).createReadStream) {
            downloadStream = (gfs as any).createReadStream({ _id: objId });
          } else {
            // Fallback: direct GridFSBucket
            const { GridFSBucket } = await import('mongodb');
            if (db) {
              const bucket = new GridFSBucket(db);
              downloadStream = bucket.openDownloadStream(objId);
            }
          }

          if (!downloadStream) {
            console.warn(`Could not create download stream for: ${fileId}`);
            resolve({ success: false, fileName, error: 'Could not create download stream' });
            return;
          }

          // Collect file data
          const chunks: Buffer[] = [];
          
          downloadStream.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          downloadStream.on('end', () => {
            try {
              if (chunks.length === 0) {
                console.warn(`Empty file: ${fileName}`);
                resolve({ success: false, fileName, error: 'File is empty' });
                return;
              }

              const fileBuffer = Buffer.concat(chunks);
              const finalFileName = attachment.fileName || fileDoc.filename || `file-${fileId}`;
              
              // Add file to ZIP archive
              archive.append(fileBuffer, { name: finalFileName });
              
              console.log(`✅ Added to ZIP: ${finalFileName} (${fileBuffer.length} bytes)`);
              resolve({ success: true, fileName: finalFileName });
            } catch (appendError) {
              console.error(`Error adding ${fileName} to ZIP:`, appendError);
              resolve({ success: false, fileName, error: String(appendError) });
            }
          });

          downloadStream.on('error', (err: any) => {
            console.error(`Error streaming file ${fileName}:`, err);
            resolve({ success: false, fileName, error: err.message });
          });

        } catch (error) {
          console.error(`Unexpected error processing attachment:`, error);
          resolve({ success: false, error: String(error) });
        }
      });

      fileProcessingPromises.push(processPromise);
    }

    // Wait for all files to be processed
    console.log('Waiting for all files to be processed...');
    const results = await Promise.all(fileProcessingPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Processed ${results.length} files: ${successful.length} successful, ${failed.length} failed`);
    
    if (successful.length === 0) {
      console.log('❌ No files were successfully added to ZIP');
      return NextResponse.json({ 
        message: "No valid files to download",
        details: { successful: 0, failed: failed.length, errors: failed.map(f => f.error) }
      }, { status: 404 });
    }

    // Finalize the archive
    await archive.finalize();
    console.log('Archive finalized');

    // Collect ZIP data
    const zipChunks: Buffer[] = [];
    
    passThrough.on('data', (chunk: Buffer) => {
      zipChunks.push(chunk);
    });

    passThrough.on('end', () => {
      console.log('ZIP stream ended');
    });

    passThrough.on('error', (err) => {
      console.error('ZIP stream error:', err);
    });

    // Wait for all ZIP data to be collected
    await new Promise<void>((resolve, reject) => {
      passThrough.on('end', () => {
        console.log('✅ ZIP stream completed');
        resolve();
      });
      
      passThrough.on('error', (err) => {
        console.error('❌ ZIP stream error:', err);
        reject(err);
      });
      
      // Set a timeout in case stream never ends
      setTimeout(() => {
        console.log('⚠️ ZIP stream timeout');
        resolve();
      }, 30000);
    });

    const zipBuffer = Buffer.concat(zipChunks);
    console.log(`✅ ZIP created: ${zipBuffer.length} bytes (${successful.length} files)`);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="complaint-${complaint.complaintNumber || complaintId}-${typeLabel}-attachments.zip"`,
        "Content-Length": zipBuffer.length.toString(),
        "X-Files-Successful": successful.length.toString(),
        "X-Files-Total": results.length.toString(),
        "X-Attachment-Type": typeLabel,
      },
    });

  } catch (error: any) {
    console.error("❌ Error creating ZIP archive:", error);
    console.error("Stack trace:", error.stack);
    
    return NextResponse.json({ 
      message: "Failed to create ZIP archive", 
      error: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * Get list of files for a complaint
 */
async function getFileList(complaintId: string, type: string = "complaint") {
  console.log('=== GET FILE LIST ===');
  console.log('Type:', type, 'complaintId:', complaintId);
  
  try {
    const query = mongoose.Types.ObjectId.isValid(complaintId) 
      ? { _id: complaintId }
      : { complaintNumber: complaintId };

    console.log('Searching with query:', query);
    
    const complaint = await OnlineComplaint.findOne(query).lean();
    if (!complaint) {
      console.log('Complaint not found');
      return NextResponse.json({ 
        message: "Complaint not found",
        debug: { complaintId, query }
      }, { status: 404 });
    }

    console.log('Complaint found:', complaint.complaintNumber);
    
    // Get attachments based on type
    let attachments: any[] = [];
    let typeLabel = "";
    
    if (type === "assignment") {
      attachments = Array.isArray(complaint.assignmentAttachments) ? complaint.assignmentAttachments : [];
      typeLabel = "assignment";
    } else {
      // Check both possible field names for complaint attachments
      attachments = Array.isArray(complaint.attachments) ? complaint.attachments : [];
      if (attachments.length === 0 && Array.isArray(complaint.complaintAttachments)) {
        attachments = complaint.complaintAttachments;
      }
      typeLabel = "complaint";
    }
    
    console.log(`Found ${attachments.length} ${typeLabel} attachments`);

    // Create file list with download URLs
    const files = attachments.map((attachment: any) => ({
      id: attachment.fileId,
      name: attachment.fileName || `file-${attachment.fileId}`,
      downloadUrl: `/api/online-complaints/attachments?complaintId=${complaint.complaintNumber}&fileId=${attachment.fileId}`,
      fileSize: attachment.fileSize,
      fileType: attachment.fileType,
      uploadedAt: attachment.uploadedAt,
      uploadedBy: attachment.uploadedBy,
      purpose: attachment.purpose || typeLabel,
      type: typeLabel,
    }));

    return NextResponse.json({
      message: "Files retrieved successfully",
      complaintNumber: complaint.complaintNumber,
      type: typeLabel,
      files: files,
      count: files.length
    });
    
  } catch (error: any) {
    console.error("Error getting complaint file list:", error);
    return NextResponse.json({ 
      message: "Failed to get file list", 
      error: error?.message || String(error) 
    }, { status: 500 });
  }
}