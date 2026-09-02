import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Role from "@/models/Role"
import bcrypt from "bcryptjs"
import { notifyUserCreated } from "@/lib/notification-events"

// Connect to database once
const connectDB = dbConnect()

export async function GET() {
  await connectDB
  try {
    const users = await User.find({}).select("-password") // Exclude password field
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users", error }, { status: 500 })
  }
}

export async function POST(req: Request) {
  await connectDB
  try {
    const body = await req.json()
    const { username, name, email, password, roleId } = body

    // Validate input
    if (!username || !name || !email || !password || !roleId) {
      return NextResponse.json({ message: "All fields are required, including role ID" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return NextResponse.json({ message: "Username or email already exists" }, { status: 400 })
    }

    // Get the role details
    const role = await Role.findById(roleId)
    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user with role details
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      role: {
        id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
      },
    })

    await newUser.save()
    
    // Return user without password
    const userResponse = await User.findById(newUser._id).select("-password")

    // Notification: alert admins that a new user account was created (non-blocking)
    notifyUserCreated({ createdUserId: String(newUser._id), createdUserName: name })

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Failed to create user", error }, { status: 500 })
  }
}