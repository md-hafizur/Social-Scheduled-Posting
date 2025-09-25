"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, Palette } from "lucide-react"

const navigation = [
  {
    name: "Social Scheduler",
    href: "/",
    icon: Calendar,
    description: "Schedule posts across platforms",
  },
  {
    name: "Product Designer",
    href: "/designer",
    icon: Palette,
    description: "Customize product designs",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View performance metrics",
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "flex items-center space-x-2 text-sm",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
