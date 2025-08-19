'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setAccessToken } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('로그인 처리 중...')

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setAccessToken(token)
      setStatus('success')
      setMessage('로그인 성공! 대시보드로 이동합니다...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
    else {
      setStatus('error')
      setMessage('로그인 실패')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}
        
        {status === 'success' && (
          <div className="text-green-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <h2 className="text-2xl font-bold mb-2">
          {status === 'loading' && '로그인 처리 중...'}
          {status === 'success' && '로그인 성공!'}
          {status === 'error' && '로그인 실패'}
        </h2>
        
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
} 