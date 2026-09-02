
'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Building, MapPin, User, Phone, X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SoftwareInfo {
  softwareType: string
  version: string
  lastUpdated: string
}

export interface Company {
  _id: string
  companyName: string
  city: string
  address: string
  companyRepresentative: string
  phoneNumber: string
  support: string
  softwareInformation?: SoftwareInfo[]
}

interface CompanySearchProps {
  onCompanySelect: (company: Company) => void
  selectedCompany: Company | null
}

export function CompanySearch({ onCompanySelect, selectedCompany }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [allCompanies, setAllCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch all companies for initial dropdown (with high limit)
  const fetchAllCompanies = async () => {
    try {
      setInitialLoading(true)
      setError('')
      
      // Fetch up to 1000 companies to populate the dropdown
      const response = await fetch('/api/company_information?limit=1000')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        // Sort companies alphabetically
        const sortedCompanies = data.sort((a, b) => 
          a.companyName.localeCompare(b.companyName)
        )
        setAllCompanies(sortedCompanies)
        setCompanies(sortedCompanies)
      } else {
        console.warn('Unexpected API response structure:', data)
        setAllCompanies([])
        setCompanies([])
      }
    } catch (error) {
      console.error('Error fetching all companies:', error)
      setError('Failed to load companies. Please try again.')
      setAllCompanies([])
      setCompanies([])
    } finally {
      setInitialLoading(false)
    }
  }

  // Search companies with API (when search term is 2+ characters)
  useEffect(() => {
    const searchCompanies = async () => {
      if (searchTerm.length < 2) {
        // Show all companies when less than 2 characters
        setCompanies(allCompanies)
        setError('')
        return
      }

      setLoading(true)
      setError('')
      
      try {
        const response = await fetch(
          `/api/company_information?search=${encodeURIComponent(searchTerm)}&limit=1000`
        )

        if (response.ok) {
          const data = await response.json()
          
          if (Array.isArray(data)) {
            if (data.length === 0) {
              setError('No companies found matching your search')
              setCompanies([])
            } else {
              setCompanies(data)
            }
          } else {
            setCompanies([])
          }
        } else {
          setError('Failed to search companies')
          setCompanies([])
        }
      } catch (error) {
        console.error('Error searching companies:', error)
        setError('Error searching companies')
        setCompanies([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchCompanies, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, allCompanies])

  // Filter locally when search term is 0-1 characters
  useEffect(() => {
    if (searchTerm.length > 0 && searchTerm.length < 2) {
      const filtered = allCompanies.filter(company => 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyRepresentative?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setCompanies(filtered)
    } else if (searchTerm.length === 0) {
      setCompanies(allCompanies)
    }
  }, [searchTerm, allCompanies])

  const handleInputFocus = () => {
    if (!selectedCompany) {
      setIsDropdownOpen(true)
      // Load all companies if not loaded yet
      if (allCompanies.length === 0 && !initialLoading) {
        fetchAllCompanies()
      }
    }
  }

  const handleInputChange = (value: string) => {
    setSearchTerm(value)
    if (!selectedCompany) {
      setIsDropdownOpen(true)
    }
  }

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company)
    setSearchTerm('')
    setIsDropdownOpen(false)
    setError('')
  }

  const handleClearSelection = () => {
    onCompanySelect(null as any)
    setSearchTerm('')
    setCompanies(allCompanies)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCompanies(allCompanies)
    setError('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-foreground/80">
        Company *
      </label>

      {/* Selected Company Display */}
      {selectedCompany ? (
        <div className="p-4 bg-gradient-to-r from-accent/15 to-accent/15 border border-primary/25 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground text-lg">
                  {selectedCompany.companyName}
                </span>
                {selectedCompany.city && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {selectedCompany.city}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-muted-foreground">
                {selectedCompany.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground/70" />
                    <span>{selectedCompany.address}</span>
                  </div>
                )}
                {selectedCompany.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground/70" />
                    <span>{selectedCompany.phoneNumber}</span>
                  </div>
                )}
                {selectedCompany.companyRepresentative && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-muted-foreground/70" />
                    <span>{selectedCompany.companyRepresentative}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-muted-foreground/70 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
              title="Change company"
            >
              <X className="h-5 w-5" />
            </button>2
          </div>
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70 z-10" />
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Click to see all companies or type to search..."
            className="pl-10 pr-10 bg-white border-border focus:border-primary focus:ring-blue-500"
          />
          
          {/* Loading indicator in input */}
          {(loading || initialLoading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
          
          {/* Clear search button */}
          {!loading && !initialLoading && searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground/70 hover:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Dropdown - Shows all companies */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-96 overflow-hidden">
              {/* Dropdown Header */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-muted/40 to-muted border-b text-xs text-muted-foreground font-medium flex items-center justify-between">
                <span>
                  {searchTerm.length >= 2 
                    ? `Search Results: "${searchTerm}" (${companies.length})` 
                    : `All Companies (${companies.length})`
                  }
                </span>
                {!initialLoading && !loading && (
                  <span className="text-muted-foreground/70">
                    {companies.length} companies
                  </span>
                )}
              </div>
              
              {/* Companies List */}
              <div className="overflow-y-auto max-h-72">
                {initialLoading ? (
                  /* Initial Loading State */
                  <div className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading all companies...</p>
                  </div>
                ) : loading ? (
                  /* Search Loading State */
                  <div className="px-4 py-8 text-center">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Searching companies...</p>
                  </div>
                ) : error && companies.length === 0 ? (
                  /* Error State */
                  <div className="px-4 py-8 text-center">
                    <div className="text-red-400 mb-2">
                      <X className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                    <button
                      type="button"
                      onClick={fetchAllCompanies}
                      className="text-sm text-primary hover:text-primary underline font-medium"
                    >
                      Click to retry
                    </button>
                  </div>
                ) : companies.length === 0 && !initialLoading && !loading ? (
                  /* No Results State */
                  <div className="px-4 py-8 text-center">
                    <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {searchTerm.length >= 2 
                        ? 'No companies match your search criteria' 
                        : 'No companies available'
                      }
                    </p>
                    {searchTerm.length >= 2 && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Try a different company name
                      </p>
                    )}
                  </div>
                ) : (
                  /* Companies List */
                  companies.map((company, index) => (
                    <button
                      key={company._id || index}
                      type="button"
                      onClick={() => handleCompanySelect(company)}
                      className="w-full px-4 py-3 text-left hover:bg-accent/15 transition-colors border-b last:border-b-0 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary group-hover:text-primary flex-shrink-0" />
                            <span className="font-medium text-foreground group-hover:text-primary truncate">
                              {company.companyName}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
                            {company.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.city}
                              </span>
                            )}
                            {company.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {company.phoneNumber}
                              </span>
                            )}
                            {company.companyRepresentative && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {company.companyRepresentative}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center ml-2 flex-shrink-0">
                          <Check className="h-4 w-4 text-transparent group-hover:text-primary" />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {/* Dropdown Footer */}
              {!initialLoading && !loading && !error && companies.length > 0 && (
                <div className="px-4 py-2 bg-gradient-to-r from-muted/40 to-muted border-t text-xs text-muted-foreground">
                  {searchTerm.length >= 2 
                    ? `Showing ${companies.length} matching companies`
                    : 'Type at least 2 characters to search by company name'
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Helper Text */}
      {!selectedCompany && (
        <p className="text-xs text-muted-foreground">
          Click on the search field to browse all companies, or type 2+ characters to search
        </p>
      )}
    </div>
  )
}