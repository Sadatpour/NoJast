"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsManagement } from "./ProductsManagement"
import { UsersManagement } from "./UsersManagement"
import { ReportedCommentsManagement } from "./ReportedCommentsManagement"
import { PendingCommentsManagement } from "./PendingCommentsManagement"
import { ContactMessagesManagement } from "./ContactMessagesManagement"

export function AdminPanel() {
  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="products">محصولات</TabsTrigger>
        <TabsTrigger value="users">کاربران</TabsTrigger>
        <TabsTrigger value="reported-comments">نظرات گزارش شده</TabsTrigger>
        <TabsTrigger value="pending-comments">نظرات در انتظار</TabsTrigger>
        <TabsTrigger value="contact-messages">پیام‌های تماس</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <ProductsManagement />
      </TabsContent>
      <TabsContent value="users">
        <UsersManagement />
      </TabsContent>
      <TabsContent value="reported-comments">
        <ReportedCommentsManagement />
      </TabsContent>
      <TabsContent value="pending-comments">
        <PendingCommentsManagement />
      </TabsContent>
      <TabsContent value="contact-messages">
        <ContactMessagesManagement />
      </TabsContent>
    </Tabs>
  )
} 