'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { User } from '@/types/User'
import { jwtDecode } from 'jwt-decode'

type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  exp: number;
  iat: number;
};

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    
    if (!accessToken) {
      router.push('/')
      return
    }

    const user = jwtDecode<JwtPayload>(accessToken)
    setUser({ name: user.name, email: user.email })
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">대시보드</h1>
          <p className="text-xl text-gray-700 mb-4">환영합니다, {user?.name}님!</p>
          <p className="text-gray-600 mb-8">JobBlog 대시보드에 오신 것을 환영합니다.</p>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 hover:cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </main>
    </>
  )
} 