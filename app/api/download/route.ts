import { NextResponse } from "next/server"
import { downloadFile } from "@/lib/downloadUtils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ message: "File ID is required" }, { status: 400 })
    }

    return await downloadFile(fileId)
  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json(
      { message: "Failed to download file" },
      { status: 500 }
    )
  }
}