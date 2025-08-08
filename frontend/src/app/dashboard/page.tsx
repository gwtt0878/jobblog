'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { User } from '@/types/User'
import { jwtDecode } from 'jwt-decode'
import Button from '@/components/Button'

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
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Button
              onClick={() => router.push('/job-posts/create')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              채용공고 등록
            </Button>
            
            <Button
              onClick={() => router.push('/job-posts/my')}
              variant="info"
              size="lg"
              className="w-full"
            >
              내가 올린 공고
            </Button>
            
            <Button
              onClick={() => router.push('/calendar')}
              variant="green"
              size="lg"
              className="w-full"
            >
              공고 일정
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="danger"
              size="lg"
              className="w-full"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </main>
    </>
  )
} 