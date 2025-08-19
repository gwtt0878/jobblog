'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import GoogleLogo from '@/components/GoogleLogo'
import { getAccessToken } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const accessToken = getAccessToken()
    if (accessToken) {
      router.push('/dashboard')
    }
  }, [router])

  const handleGoogleLogin = () => {
    const redirectUri = `${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}`
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`
    window.location.href = url
  }

  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-6xl font-bold mb-4">JobBlog</h1>
        <p className="text-xl text-gray-700 mb-8">환영합니다!</p>
        <p className="text-xl text-gray-700 mb-8">로그인 후 이용해주세요.</p>
        
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          <GoogleLogo />
          <p className="text-md">Google 계정으로 시작하기</p>
        </button>
      </main>
    </>
  )
}