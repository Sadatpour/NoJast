import { Metadata } from "next"

export const metadata: Metadata = {
  title: "ثبت محصول جدید | نوجَست",
  description: "ثبت محصول یا خدمت جدید در نوجَست",
}

export default function SubmitProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 