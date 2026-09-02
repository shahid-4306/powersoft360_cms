'use client'

import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

interface VerifiedSoftwareTypeInfoProps {
  softwareType?: string
  onResolved: (softwareOptions: string[]) => void
}

/**
 * Requirement — Automatic Software Type Selection
 *
 * Mirrors VerifiedCompanyInfo's backend-driven resolution pattern:
 * the verified customer's account already stores the Software
 * Type(s) associated with it (a single value, or a comma‑separated
 * list when the account is linked to multiple software types — see
 * components/Register/RegisterPage.tsx). Instead of trusting that
 * raw value blindly, this component fetches the authoritative,
 * Administrator-managed Active Software Types list from the backend
 * (/api/software-types) and resolves the verified account's
 * software type(s) against it, so the caller can populate a
 * dropdown with exactly the software types genuinely tied to this
 * account — one or many.
 */
export function VerifiedSoftwareTypeInfo({ softwareType, onResolved }: VerifiedSoftwareTypeInfoProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedTypes, setResolvedTypes] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    if (!softwareType || !softwareType.trim()) {
      setLoading(false)
      setError('No verified software type found on this account.')
      onResolved([])
      return
    }

    setLoading(true)
    setError('')

    // The account may hold one or several software types, stored as a
    // comma-separated string (same convention used for companyName).
    const accountTypes = Array.from(
      new Set(
        softwareType
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    )

    fetch('/api/software-types')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load software types'))))
      .then((data) => {
        if (!isMounted) return

        const activeNames: string[] = Array.isArray(data.softwareTypes)
          ? data.softwareTypes.map((t: { name: string }) => t.name).filter(Boolean)
          : []

        const normalized = (name: string) => name.trim().toLowerCase()
        const activeByNormalizedName = new Map(activeNames.map((n) => [normalized(n), n]))

        // Keep only the account's software types that are still Active,
        // using the canonical casing from the backend list.
        const matched = accountTypes
          .map((t) => activeByNormalizedName.get(normalized(t)))
          .filter((t): t is string => Boolean(t))

        setResolvedTypes(matched)

        if (matched.length === 0) {
          setError('Your verified software type(s) could not be found. Please contact support.')
        }

        onResolved(matched)
      })
      .catch(() => {
        if (!isMounted) return
        setError('Unable to retrieve your verified software type information.')
        onResolved([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [softwareType])

  return (
    <div className="space-y-2">
      {loading && (
        <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-muted/50 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Retrieving your verified software type information...
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-3 border border-amber-200 rounded-md bg-amber-50 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && resolvedTypes.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-900">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {resolvedTypes.length === 1
            ? `Verified software type: ${resolvedTypes[0]}`
            : `${resolvedTypes.length} verified software types found on your account.`}
        </div>
      )}
    </div>
  )
}