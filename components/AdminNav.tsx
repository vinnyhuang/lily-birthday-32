"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/tokens", label: "Invite Tokens" },
    { href: "/admin/pages", label: "Guest Pages" },
    { href: "/admin/aggregate", label: "Aggregate Views" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-[#E8DFD6] z-50 shadow-sm">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-2xl text-primary">🎂 Lily&apos;s 32nd</span>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className={pathname === item.href ? "bg-[#FCEAE6] text-primary" : ""}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
