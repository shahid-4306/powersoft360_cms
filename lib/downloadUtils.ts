import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { getGridFS, GridFSFileWithMetadata } from "./gridfs"

export async function downloadFile(fileId: string) {
  try {
    // Validate fileId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ message: "Invalid fileId" }, { status: 400 })
    }

    const gfs = await getGridFS()

    // Find file metadata with proper typing
    const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray() as GridFSFileWithMetadata[]
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

    const fileDoc = files[0]
    
    // Create a proper readable stream
    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId))

    // Convert stream to buffer properly
    const chunks: Buffer[] = []
    
    return new Promise<Response>((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk)
      })

      downloadStream.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks)
          const headers = new Headers()
          
          // Set proper content type - get from metadata or use default
          const contentType = fileDoc.metadata?.contentType || "application/octet-stream"
          headers.set("Content-Type", contentType)
          
          // Set filename for download
          const filename = fileDoc.filename || `file-${fileId}`
          headers.set(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(filename)}"`
          )
          
          // Set content length
          headers.set("Content-Length", buffer.length.toString())
          
          resolve(new Response(buffer, { 
            status: 200, 
            headers 
          }))
        } catch (error) {
          reject(error)
        }
      })

      downloadStream.on('error', (err) => {
        console.error('GridFS download error:', err)
        reject(new Error('Failed to download file'))
      })
    })
  } catch (error) {
    console.error('Download utility error:', error)
    return NextResponse.json(
      { message: "Failed to download file", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    // Images
    "image/jpeg", "image/png", "image/jpg",

    // PDF
    "application/pdf",

    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Text & Additional Types
    "text/plain",
    "text/csv",
    "application/zip",
    "application/x-rar-compressed",
    "application/json",
  ]

  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".xlsx", ".xls", ".doc", ".docx", ".txt"]

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  return allowedTypes.includes(file.type) || (fileExtension ? allowedExtensions.includes(fileExtension) : false)
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}