import { Metadata } from "next"

export const metadata: Metadata = {
  title: "داشبورد | نوجَست",
  description: "مدیریت محتوا و کاربران سایت نوجَست",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-8">
      {children}
    </div>
  )
} 