

"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import {  Download, Search } from "lucide-react"
import { useDashboardAnalytics, AnalyticsRow, MetricConfig } from "@/hooks/use-dashboard-analytics"
import type { Task, Complaint } from "@/hooks/use-dashboard"

type SortKey = keyof Pick<
  AnalyticsRow,
  "code" | "companyName" | "category" | "assignedStaff" | "status" | "createdAt"
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

interface DashboardMetricModalProps {
  metricKey: string | null
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  complaints: Complaint[]
  userTasks: Task[]
  userComplaints: Complaint[]
}

export function DashboardMetricModal({
  metricKey,
  onOpenChange,
  tasks,
  complaints,
  userTasks,
  userComplaints,
}: DashboardMetricModalProps) {
  const { metric, rows } = useDashboardAnalytics(metricKey, tasks, complaints, userTasks, userComplaints)
  const open = Boolean(metricKey)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-indigo-50/90 backdrop-blur-sm rounded-2xl sm:max-w-6xl w-full max-h-[85vh] overflow-y-auto"
        aria-describedby={metric ? "dashboard-metric-modal-description" : undefined}
      >
        {metric && (
          <MetricDetailContent key={metricKey} metricKey={metricKey as string} metric={metric} rows={rows} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function MetricDetailContent({
  metricKey,
  metric,
  rows,
}: {
  metricKey: string
  metric: MetricConfig
  rows: AnalyticsRow[]
}) {
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

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <DialogTitle className="text-2xl font-bold">{metric.label}</DialogTitle>
            <DialogDescription id="dashboard-metric-modal-description" className="text-sm">
              {metric.description}
            </DialogDescription>
          </div>
          
        </div>
      </DialogHeader>

     
       
     
       
        
      <Card className="rounded-2xl">
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
                <TableHead>Complaint</TableHead>
                <SortableHead label="Category" sortKey="category" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Assigned Staff" sortKey="assignedStaff" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Status" sortKey="status" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortableHead label="Created" sortKey="createdAt" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
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
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>{formatDate(r.completionDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              Page <span className="font-mono">{page}</span> of{" "}
              <span className="font-mono">{totalPages}</span> ·{" "}
              <span className="font-mono">{filteredRows.length}</span> record(s)
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
    </>
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
        {active === sortKey && <span className="text-[10px] uppercase">{dir}</span>}
      </button>
    </TableHead>
  )
}