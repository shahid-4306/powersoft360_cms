// components/company/CompanyImportDialog.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSpreadsheet, Loader2, Upload, CheckCircle2, AlertTriangle } from "lucide-react";

interface ImportResultRow {
  row: number;
  code?: string;
  companyName?: string;
  status: "inserted" | "updated" | "skipped_duplicate_in_file" | "error";
  message?: string;
}

interface ImportSummary {
  totalRows: number;
  inserted: number;
  updated: number;
  skippedDuplicateInFile: number;
  errors: number;
}

interface CompanyImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<{ message: string; summary: ImportSummary; results: ImportResultRow[] }>;
}

export function CompanyImportDialog({ isOpen, onOpenChange, onImport }: CompanyImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [results, setResults] = useState<ImportResultRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setError(null);
    setSummary(null);
    setResults([]);
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
    setSummary(null);
    setResults([]);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose an XLSX file first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const data = await onImport(selectedFile);
      setSummary(data.summary);
      setResults(data.results || []);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message || "Failed to import companies. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const errorRows = results.filter((r) => r.status === "error");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" style={{ color: "#11519B" }} />
            Import Companies from XLSX
          </DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) file with columns for Company ID and Company Name
            (required), and City, Mobile Number, and Remarks (optional). Companies that
            already exist (matched by Company ID or Company Name) will never be
            duplicated — they are automatically detected and merged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center border-muted-foreground/25">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="company-xlsx-input"
            />
            <label htmlFor="company-xlsx-input" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {selectedFile ? selectedFile.name : "Click to choose an XLSX file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only .xlsx / .xls files are accepted (max 10MB)
              </p>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 border border-red-200 rounded-md bg-red-50 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {summary && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 border border-green-200 rounded-md bg-green-50 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{message}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-md bg-muted/40">
                  <div className="text-lg font-semibold text-foreground">{summary.totalRows}</div>
                  <div className="text-xs text-muted-foreground">Rows read</div>
                </div>
                <div className="p-2 rounded-md bg-muted/40">
                  <div className="text-lg font-semibold text-green-700">{summary.inserted}</div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
                <div className="p-2 rounded-md bg-muted/40">
                  <div className="text-lg font-semibold text-blue-700">{summary.updated}</div>
                  <div className="text-xs text-muted-foreground">Matched existing</div>
                </div>
                <div className="p-2 rounded-md bg-muted/40">
                  <div className="text-lg font-semibold text-red-700">{summary.errors}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
              </div>

              {errorRows.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Row</th>
                        <th className="text-left p-2">Company</th>
                        <th className="text-left p-2">Issue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorRows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{r.row}</td>
                          <td className="p-2">{r.companyName || r.code || "—"}</td>
                          <td className="p-2 text-red-700">{r.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="flex-1"
              style={{ background: "linear-gradient(135deg, #11519B, #114A9B)" }}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </span>
              ) : (
                "Import"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {summary ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}