"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Edit, Trash2, User, Shield } from "lucide-react"

interface UsersTableProps {
  users: any[]
  onEdit: (user: any) => void
  onDelete: (user: any) => void
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-4 w-4" />
          Users ({users.length})
        </CardTitle>
        <CardDescription className="text-sm">System users and their assigned roles</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium">No users created yet</p>
            <p className="text-xs">Create your first user to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">
                    Permissions
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-muted/50 hover:bg-accent/15 transition-colors"}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-cyan-500 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        @{user.username}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <span className="text-foreground text-xs truncate max-w-[120px] block" title={user.email}>
                        {user.email}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 text-primary mr-1" />
                        <Badge className="bg-primary text-xs">{user.role?.name || "No Role"}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {user.role?.permissions && (
                        <div className="flex flex-wrap gap-1">
                          {user.role.permissions.slice(0, 2).map((permission: string) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission.split(".")[0]}
                            </Badge>
                          ))}
                          {user.role.permissions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.role.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}