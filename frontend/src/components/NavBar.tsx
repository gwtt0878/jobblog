'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

export default function NavBar() {
  const [health, setHealth] = useState('Checking...')

  useEffect(() => {
    axios.get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth('Server is down 😢'))
  }, [])

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">JobBlog</h1>
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