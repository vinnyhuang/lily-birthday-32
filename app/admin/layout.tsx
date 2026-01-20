import { isAdminAuthenticated } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await isAdminAuthenticated();

  // Allow login page without auth
  // The check happens per-page for the login route

  return (
    <div className="min-h-screen">
      {isAuthenticated && <AdminNav />}
      <main className={isAuthenticated ? "pt-16" : ""}>{children}</main>
    </div>
  );
}
