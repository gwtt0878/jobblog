'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { getAccessToken } from '@/lib/auth'
import { JobPostRequestDto, JobStatus } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'

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
      const accessToken = getAccessToken()
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
                  회사명 * (최대 128자)
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  maxLength={128}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="회사명을 입력하세요"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.companyName.length}/128자
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  채용공고 제목 * (최대 128자)
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={128}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="채용공고 제목을 입력하세요"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/128자
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  채용공고 내용 * (최대 4096자)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={4096}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="채용공고 내용을 입력하세요"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/4096자
                </p>
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
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="secondary"
                  size="lg"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                >
                  {loading ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 