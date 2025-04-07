"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function MainNav() {
  const pathname = usePathname()
  const { isAuthenticated, isEmployer, isFreelancer, logout } = useAuth()

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Job Bidding Platform
          </Link>
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/jobs"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/jobs" || pathname.startsWith("/jobs/") ? "text-primary" : "text-muted-foreground",
                )}
              >
                Jobs
              </Link>
              {isEmployer && (
                <Link
                  href="/jobs/create"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/jobs/create" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Post a Job
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

