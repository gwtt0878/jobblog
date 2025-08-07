'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { JobPostRequestDto, JobStatus } from '@/types/JobPost'
import NavBar from '@/components/NavBar'

export default function CreateJobPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<JobPostRequestDto>({
    companyName: '',
    title: '',
    description: '',
    applyUrl: '',
    closingDateTime: '',
    status: JobStatus.SAVED
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        router.push('/')
        return
      }

      await axios.post('/job-posts', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      router.push('/job-posts/my')
    } catch (error) {
      console.error('채용공고 생성 실패:', error)
      alert('채용공고 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">채용공고 등록</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  회사명 *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="회사명을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  채용공고 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="채용공고 제목을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  채용공고 내용 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="채용공고 내용을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="applyUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  지원 URL *
                </label>
                <input
                  type="url"
                  id="applyUrl"
                  name="applyUrl"
                  value={formData.applyUrl}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/apply"
                />
              </div>

              <div>
                <label htmlFor="closingDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                  마감일시 *
                </label>
                <input
                  type="datetime-local"
                  id="closingDateTime"
                  name="closingDateTime"
                  value={formData.closingDateTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  {loading ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 