"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDashboard } from "@/hooks/use-dashboard"
import { useDashboardAnalytics, AnalyticsRow } from "@/hooks/use-dashboard-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  Loader2,
  Search,
} from "lucide-react"

type SortKey = keyof Pick<
  AnalyticsRow,
  "code" | "companyName" | "category" | "assignedStaff" | "status" | "priority" | "createdAt"
>

const PAGE_SIZE = 10

const STATUS_BADGE_CLASS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  done: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
  approved: "bg-amber-100 text-amber-700",
  pending: "bg-rose-100 text-rose-700",
  "in-progress": "bg-accent/30 text-primary",
  "on-hold": "bg-orange-100 text-orange-700",
  closed: "bg-muted text-foreground/80",
  rejected: "bg-red-100 text-red-700",
  registered: "bg-secondary/15 text-secondary",
  assigned: "bg-purple-100 text-purple-700",
  unposted: "bg-muted text-foreground/80",
}

function formatDate(value: string) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function exportCsv(rows: AnalyticsRow[], filename: string) {
  const headers = [
    "Code",
    "Company ID",
    "Company Name",
    "Title / Complaint",
    "Category",
    "Assigned Staff",
    "Status",
    "Priority",
    "Created Date",
    "Completion Date",
  ]
  const escape = (v: string) => `"${(v ?? "").toString().replace(/"/g, '""')}"`
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.code,
        r.companyId,
        r.companyName,
        r.title,
        r.category,
        r.assignedStaff,
        r.status,
        r.priority,
        formatDate(r.createdAt),
        formatDate(r.completionDate),
      ]
        .map(escape)
        .join(","),
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function DashboardAnalyticsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metricKey = searchParams.get("metric")

  const { tasks, complaints, userTasks, userComplaints, isLoading, user } = useDashboard()
  const { metric, rows } = useDashboardAnalytics(metricKey, tasks, complaints, userTasks, userComplaints)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const statusOptions = useMemo(() => {
    const unique = new Set(rows.map((r) => r.status).filter(Boolean))
    return ["all", ...Array.from(unique)]
  }, [rows])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = rows.filter((r) => {
      const matchesSearch =
        !term ||
        r.code.toLowerCase().includes(term) ||
        r.companyName.toLowerCase().includes(term) ||
        r.title.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term) ||
        r.assignedStaff.toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })

    result = [...result].sort((a, b) => {
      const av = a[sortKey] || ""
      const bv = b[sortKey] || ""
      if (sortKey === "createdAt") {
        const diff = new Date(av).getTime() - new Date(bv).getTime()
        return sortDir === "asc" ? diff : -diff
      }
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [rows, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
    setPage(1)
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!metric) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">
              No analytics metric was specified. Go back to the dashboard and click a stats card.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{metric.label}</h1>
          <p className="text-muted-foreground text-sm">{metric.description}</p>
        </div>
        <Button variant="outline" onClick={() => exportCsv(filteredRows, `${metricKey}-report.csv`)}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Filtered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metric.dataset}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">Statuses Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.max(0, statusOptions.length - 1)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search company, code, staff, category..."
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="border border-border rounded-md p-2 text-sm bg-white"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Code" sortKey="code" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Company" sortKey="companyName" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <TableHead>Title / Complaint</TableHead>
                <SortableHead label="Category" sortKey="category" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Assigned Staff" sortKey="assignedStaff" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Status" sortKey="status" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Priority" sortKey="priority" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Created" sortKey="createdAt" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                    No records match your filters.
                  </TableCell>
                </TableRow>
              )}
              {pageRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.code}</TableCell>
                  <TableCell>{r.companyName}</TableCell>
                  <TableCell className="max-w-[280px] truncate" title={r.title}>{r.title || "—"}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.assignedStaff}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE_CLASS[r.status] || "bg-muted text-foreground/80"} variant="outline">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.priority}</TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>{formatDate(r.completionDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} · {filteredRows.length} record(s)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SortableHead({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  active: SortKey
  dir: "asc" | "desc"
  onSort: (key: SortKey) => void
}) {
  return (
    <TableHead>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-primary transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown className={`w-3.5 h-3.5 ${active === sortKey ? "text-primary" : "text-muted-foreground"}`} />
        {active === sortKey && <span className="text-[10px] uppercase">{dir}</span>}
      </button>
    </TableHead>
  )
}
