"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Edit, Trash2 } from "lucide-react"

interface RolesGridProps {
  roles: any[]
  onEdit: (role: any) => void
  onDelete: (role: any) => void
}

export function RolesGrid({ roles, onEdit, onDelete }: RolesGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Roles ({roles.length})
        </CardTitle>
        <CardDescription>Available roles and their permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role._id} className="border rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{role.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(role)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(role)}
                      className="text-red-500 border-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission: string) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}