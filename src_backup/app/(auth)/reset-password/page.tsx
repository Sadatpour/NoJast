import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "تغییر رمز عبور | نوجَست",
  description: "تغییر رمز عبور حساب کاربری در نوجَست",
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <ResetPasswordForm />
    </div>
  )
} 