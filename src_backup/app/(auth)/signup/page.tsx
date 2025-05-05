import { SignupForm } from "@/components/auth/SignupForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ثبت‌نام | نوجَست",
  description: "ثبت‌نام در نوجَست و کشف محصولات نو",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <SignupForm />
    </div>
  )
} 