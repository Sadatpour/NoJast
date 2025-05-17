'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('خطای غیرمنتظره:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[50vh] w-full flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-red-500">متأسفانه خطایی رخ داده است</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            لطفاً صفحه را رفرش کنید یا بعداً دوباره تلاش کنید
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            تلاش مجدد
          </button>
        </div>
      )
    }

    return this.props.children
  }
} 