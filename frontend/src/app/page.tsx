'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

export default function Home() {
  const [health, setHealth] = useState('Checking...')

  useEffect(() => {
    axios.get('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setHealth('Server is down 😢'))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">JobBlog</h1>
      <p className="text-xl text-gray-700">서버 상태: <span className="font-semibold">{health}</span></p>
    </main>
  )
}