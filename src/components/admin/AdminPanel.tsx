"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsManagement } from "./ProductsManagement"
import { UsersManagement } from "./UsersManagement"
import { ReportedCommentsManagement } from "./ReportedCommentsManagement"
import { PendingCommentsManagement } from "./PendingCommentsManagement"
import { AdsManagement } from "./AdsManagement"
import { ContactMessagesManagement } from "./ContactMessagesManagement"

export function AdminPanel() {
  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList>
        <TabsTrigger value="products">محصولات</TabsTrigger>
        <TabsTrigger value="users">کاربران</TabsTrigger>
        <TabsTrigger value="pending-comments">نظرات در انتظار تایید</TabsTrigger>
        <TabsTrigger value="comments">نظرات گزارش شده</TabsTrigger>
        <TabsTrigger value="ads">مدیریت تبلیغات</TabsTrigger>
        <TabsTrigger value="contact">پیام‌های ارتباط با ما</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <ProductsManagement />
      </TabsContent>
      
      <TabsContent value="users" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <UsersManagement />
      </TabsContent>
      
      <TabsContent value="pending-comments" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <PendingCommentsManagement />
      </TabsContent>
      
      <TabsContent value="comments" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <ReportedCommentsManagement />
      </TabsContent>
      
      <TabsContent value="ads" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <AdsManagement />
      </TabsContent>
      
      <TabsContent value="contact" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <ContactMessagesManagement />
      </TabsContent>
    </Tabs>
  )
} 