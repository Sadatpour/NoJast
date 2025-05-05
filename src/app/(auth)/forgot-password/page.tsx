import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "بازیابی رمز عبور | نوجَست",
  description: "بازیابی رمز عبور حساب کاربری در نوجَست",
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <ForgotPasswordForm />
    </div>
  )
} 