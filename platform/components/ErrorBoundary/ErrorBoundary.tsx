/**
 * Error Boundary Component
 * Kullanım: React error catching ve fallback UI
 * Bağımlılıklar: ErrorFallback.tsx
 */

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { ErrorFallback } from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Report to telemetry endpoint in production
    if (process.env.NODE_ENV === 'production' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const body = JSON.stringify({
        message: error.message,
        stack: error.stack?.slice(0, 1000),
        componentStack: errorInfo.componentStack?.slice(0, 1000),
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        timestamp: Date.now(),
      })
      navigator.sendBeacon('/api/errors', body)
    }

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
