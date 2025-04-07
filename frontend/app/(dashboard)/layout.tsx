import type React from "react"
import { MainNav } from "@/components/main-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className="py-6 text-center text-gray-600 bg-gray-100">
        <p>© {new Date().getFullYear()} Job Bidding Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

