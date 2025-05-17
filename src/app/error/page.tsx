'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function ErrorPage() {
  const router = useRouter()

  useEffect(() => {
    logger.error('Error page accessed')
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-500">خطا</h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
          >
            بازگشت به صفحه قبل
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="default"
          >
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
    </div>
  )
} 