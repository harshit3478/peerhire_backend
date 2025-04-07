import type React from "react"
import { MainNav } from "@/components/main-nav"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}

