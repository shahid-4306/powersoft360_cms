'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldCheck, AlertTriangle, ChevronDown } from 'lucide-react'

export interface SoftwareInfo {
  softwareType: string
  version?: string
  lastUpdated?: string
}

export interface VerifiedCompany {
  _id: string
  companyName: string
  city?: string
  address?: string
  companyRepresentative?: string
  phoneNumber?: string
  support?: string
  softwareInformation?: SoftwareInfo[]
}

interface VerifiedCompanyInfoProps {
  /**
   * The verified account's `companyName` field. May contain a single
   * company or a comma-separated list of companies when the underlying
   * registration selected multiple companies.
   */
  companyName?: string
  onResolved: (company: VerifiedCompany | null, softwareOptions: string[]) => void
}

function getSoftwareOptions(company: VerifiedCompany | null): string[] {
  if (!company || !Array.isArray(company.softwareInformation)) return []
  return Array.from(
    new Set(
      company.softwareInformation
        .map((s) => s.softwareType)
        .filter((t): t is string => Boolean(t)),
    ),
  )
}

/**
 * Requirement No. 1 — Automatic Company and Software Selection
 *
 * Once a customer is verified (see CustomerAuthContext), their
 * `companyName` field is already known from the approved registration
 * record — it may hold one company, or a comma-separated list of
 * multiple companies when the registration selected more than one.
 *
 * This component resolves the matching CompanyInformation record(s) for
 * every listed company name:
 *  - Exactly one company resolved → it is auto-selected and shown as a
 *    read-only value (no dropdown).
 *  - More than one company resolved → a Company dropdown is shown so the
 *    user can pick which company the complaint is being raised for.
 *
 * Whichever company ends up selected, its registered software products
 * are reported back via `onResolved` so the caller can populate the
 * Software Type field using the same single-vs-dropdown rule.
 */
export function VerifiedCompanyInfo({ companyName, onResolved }: VerifiedCompanyInfoProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [companies, setCompanies] = useState<VerifiedCompany[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const companyNames = useMemo(
    () =>
      Array.from(
        new Set(
          (companyName || '')
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean),
        ),
      ),
    [companyName],
  )

  useEffect(() => {
    let isMounted = true

    if (companyNames.length === 0) {
      setLoading(false)
      setCompanies([])
      setError('No verified company found on this account.')
      onResolved(null, [])
      return
    }

    setLoading(true)
    setError('')

    const normalized = (name: string) => name.trim().toLowerCase()

    Promise.all(
      companyNames.map((name) =>
        fetch(`/api/company_information?search=${encodeURIComponent(name)}&limit=50`)
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load company'))))
          .then((data: VerifiedCompany[]) => {
            const exactMatch =
              data.find((c) => normalized(c.companyName) === normalized(name)) || data[0] || null
            return exactMatch
          })
          .catch(() => null),
      ),
    ).then((resolved) => {
      if (!isMounted) return

      const found = resolved.filter((c): c is VerifiedCompany => Boolean(c))

      setCompanies(found)
      setSelectedIndex(0)

      if (found.length === 0) {
        setError('Your verified company record could not be found. Please contact support.')
        onResolved(null, [])
      } else {
        onResolved(found[0], getSoftwareOptions(found[0]))
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [companyNames])

  const handleSelectCompany = (index: number) => {
    setSelectedIndex(index)
    const selected = companies[index] || null
    onResolved(selected, getSoftwareOptions(selected))
  }

  const isMultiCompany = companies.length > 1
  const selectedCompany = companies[selectedIndex] || null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/80">Company</label>

      {loading && (
        <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/50 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Retrieving your verified company information...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-3 border border-amber-200 rounded-md bg-amber-50 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && isMultiCompany && (
        <div className="space-y-1.5">
          <div className="relative">
            <select
              value={selectedIndex}
              onChange={(e) => handleSelectCompany(Number(e.target.value))}
              className="w-full appearance-none p-3 pr-9 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-primary bg-white text-sm text-foreground"
            >
              {companies.map((company, index) => (
                <option key={company._id || company.companyName} value={index}>
                  {company.companyName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {selectedCompany && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 font-medium text-green-900">
                <ShieldCheck className="w-4 h-4" />
                {selectedCompany.companyName}
              </div>
              {(selectedCompany.city || selectedCompany.address) && (
                <div className="text-sm text-green-700 mt-1">
                  {[selectedCompany.city, selectedCompany.address].filter(Boolean).join(', ')}
                </div>
              )}
              <p className="text-xs text-green-600 mt-1">
                Verified company — select the company this complaint is for.
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && !isMultiCompany && selectedCompany && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 font-medium text-green-900">
            <ShieldCheck className="w-4 h-4" />
            {selectedCompany.companyName}
          </div>
          {(selectedCompany.city || selectedCompany.address) && (
            <div className="text-sm text-green-700 mt-1">
              {[selectedCompany.city, selectedCompany.address].filter(Boolean).join(', ')}
            </div>
          )}
          <p className="text-xs text-green-600 mt-1">
            Verified company — automatically detected, cannot be changed.
          </p>
        </div>
      )}
    </div>
  )
}
