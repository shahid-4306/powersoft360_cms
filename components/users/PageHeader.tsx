"use client"

import { Button } from "@/components/ui/button"
import { Plus, Shield } from "lucide-react"

interface PageHeaderProps {
  onCreateUser: () => void
  onCreateRole: () => void
}

export function PageHeader({ onCreateUser, onCreateRole }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto bg-transparent"
          onClick={onCreateRole}
        >
          <Shield className="h-4 w-4 mr-2" />
          Create Role
        </Button>

        <Button 
          className="bg-gradient-to-r from-primary to-cyan-600 hover:from-primary hover:to-cyan-700 w-full sm:w-auto"
          onClick={onCreateUser}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>
    </div>
  )
}