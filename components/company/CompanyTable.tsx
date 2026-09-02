"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Edit, Trash2, FileText, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"

interface Company {
  _id?: string
  code: string
  companyName: string
  city: string
  phoneNumber: string
  address: string
  support: string
  designatedDeveloper: string
  companyRepresentative: string
  softwareInformation: any[]
  createdAt?: string
}

interface CompanyTableProps {
  companies: Company[]
  isLoading: boolean
  onEdit: (company: Company) => void
  onDelete: (companyId: string) => void
}

export function CompanyTable({ companies, isLoading, onEdit, onDelete }: CompanyTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const totalPages = Math.ceil(companies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = companies.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const maxVisiblePages = 5
    const pages = []
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (startPage > 1) {
      pages.unshift('...')
      pages.unshift(1)
    }
    if (endPage < totalPages) {
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 mt-8">
      <CardHeader className="bg-gradient-to-r from-accent/15 to-accent/30/50 rounded-t-xl border-b border-primary/25/50 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          All Companies ({companies.length})
        </CardTitle>
        <CardDescription className="text-sm">Complete list of all companies in the system</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="h-16 w-16 mx-auto mb-4 opacity-50 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No companies created yet</p>
            <p className="text-sm">Create your first company using the form above</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      City
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Support
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Developer
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Representative
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border/50">
                  {currentCompanies.map((company, index) => (
                    <tr
                      key={company._id}
                      className={`${index % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-muted/30 transition-colors`}
                    >
                      <td className="px-3 py-3">
                        <Badge variant="outline" className="text-xs font-mono">
                          {company.code?.split("-")[1]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 text-muted-foreground mr-2" />
                          <span
                            className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24"
                            title={company.companyName}
                          >
                            {company.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-foreground truncate max-w-20 block" title={company.city}>
                          {company.city}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-foreground text-xs">{company.phoneNumber}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-foreground truncate max-w-[100px] block text-xs" title={company.address}>
                          {company.address}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <Badge variant={company.support === "Active" ? "default" : "destructive"}>
                          {company.support}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-foreground text-xs">{company.designatedDeveloper}</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-foreground text-xs">{company.companyRepresentative}</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className="text-foreground text-xs">
                          {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(company)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => company._id && onDelete(company._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="itemsPerPage" className="text-sm font-medium">
                  Company per page:
                </label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger id="itemsPerPage" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : page === '...' ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...' || isLoading}
                      className={page === '...' ? "cursor-default" : "min-w-[32px] text-xs"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="min-w-[90px] text-xs sm:text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}