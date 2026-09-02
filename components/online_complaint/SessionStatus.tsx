'use client'

import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface SessionStatusProps {
  isLoaded: boolean
  isSignedIn: boolean
  token: string | null
  isExpired: boolean
}

export function SessionStatus({ isLoaded, isSignedIn, token, isExpired }: SessionStatusProps) {
  // Convert to proper booleans
  const loaded = Boolean(isLoaded);
  const signedIn = Boolean(isSignedIn);
  const expired = Boolean(isExpired);

  console.log('SessionStatus:', { loaded, signedIn, expired, token });

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to register a complaint.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Session Expired</h2>
            <p className="text-muted-foreground mb-4">
              Your session has expired. Please sign in again to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, return null to show the main content
  return null;
}