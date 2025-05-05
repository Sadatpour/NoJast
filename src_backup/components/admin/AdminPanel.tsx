"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsManagement } from "./ProductsManagement"
import { UsersManagement } from "./UsersManagement"
import { ReportedCommentsManagement } from "./ReportedCommentsManagement"

export function AdminPanel() {
  return (
    <Tabs defaultValue="products" className="space-y-6">
      <TabsList>
        <TabsTrigger value="products">محصولات</TabsTrigger>
        <TabsTrigger value="users">کاربران</TabsTrigger>
        <TabsTrigger value="comments">نظرات گزارش شده</TabsTrigger>
      </TabsList>
      
      <TabsContent value="products" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <ProductsManagement />
      </TabsContent>
      
      <TabsContent value="users" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <UsersManagement />
      </TabsContent>
      
      <TabsContent value="comments" className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <ReportedCommentsManagement />
      </TabsContent>
    </Tabs>
  )
} 