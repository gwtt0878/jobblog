'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { getAccessToken } from '@/lib/auth'

export default function NavBar() {
  const router = useRouter()
  const [health, setHealth] = useState('Checking...')

  useEffect(() => {
    axios.get('/health', {withCredentials: false})
      .then((res) => setHealth(res.data))
      .catch(() => setHealth('Server is down 😢'))
  }, [])

  const handleLogoClick = () => {
    const accessToken = getAccessToken()
    if (accessToken) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              onClick={handleLogoClick}
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            >
              JobBlog
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">서버 상태:</span>
              <span className={`text-sm font-semibold ${
                health === 'Server is down 😢' 
                  ? 'text-red-600' 
                  : health === 'Checking...' 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
              }`}>
                {health}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 