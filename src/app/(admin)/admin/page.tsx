import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminPanel } from "@/components/admin/AdminPanel"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "پنل مدیریت | نوجَست",
  description: "مدیریت محتوا و کاربران سایت نوجَست",
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }
  
  // Check if user is an admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">پنل مدیریت</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          مدیریت محتوا و کاربران سایت
        </p>
      </div>

      <AdminPanel />
    </div>
  )
} 