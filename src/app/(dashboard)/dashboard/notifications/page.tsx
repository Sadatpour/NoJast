import { redirect } from "next/navigation"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { DashboardNotifications } from "@/components/notifications/DashboardNotifications"

export const metadata: Metadata = {
  title: "اعلان‌ها | نوجَست",
  description: "مدیریت اعلان‌های حساب کاربری در نوجَست",
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">اعلان‌ها</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          مدیریت اعلان‌های حساب کاربری
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <DashboardNotifications userId={user.id} />
      </div>
    </div>
  )
} 