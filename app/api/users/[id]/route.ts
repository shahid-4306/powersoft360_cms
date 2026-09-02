import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Role from "@/models/Role"

// Connect to database once
const connectDB = dbConnect()

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await connectDB;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Failed to fetch user", error }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB;

  try {
    const updateData = await req.json()

    console.log("Updating user ID:", id)
    console.log("Update data:", updateData)

    // Check if user exists
    const existingUser = await User.findById(id)
    if (!existingUser) {
      console.log("User not found for ID:", id)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // If role is being updated, get the full role details
    if (updateData.roleId) {
      const role = await Role.findById(updateData.roleId)
      if (!role) {
        return NextResponse.json({ message: "Role not found" }, { status: 404 })
      }

      // Replace roleId with full role object
      updateData.role = {
        id: role._id.toString(),
        name: role.name,
        permissions: role.permissions,
      }
      delete updateData.roleId
    }

    // Don't update password if it's empty (in case of edit)
    if (updateData.password === "") {
      delete updateData.password
    }

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found after update" }, { status: 404 })
    }

    console.log("User updated successfully:", updatedUser._id)
    return NextResponse.json(updatedUser)

  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  await connectDB;

  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: { id: deletedUser._id, name: deletedUser.name }
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
}