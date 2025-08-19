'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import { getAccessToken } from '@/lib/auth'
import { JobPostRequestDto, JobPostResponseDto, JobStatus } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'

export default function EditJobPost() {
  const router = useRouter()
  const params = useParams()
  const jobPostId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<JobPostRequestDto>({
    companyName: '',
    title: '',
    description: '',
    applyUrl: '',
    closingDateTime: '',
    status: JobStatus.SAVED
  })

  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const accessToken = getAccessToken()
        if (!accessToken) {
          router.push('/')
          return
        }

        const response = await axios.get(`/job-posts/${jobPostId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        const jobPost: JobPostResponseDto = response.data
        
        // datetime-local 형식으로 변환
        const closingDateTime = new Date(jobPost.closingDateTime)
          .toISOString()
          .slice(0, 16)

        setFormData({
          companyName: jobPost.companyName,
          title: jobPost.title,
          description: jobPost.description,
          applyUrl: jobPost.applyUrl,
          closingDateTime: closingDateTime,
          status: jobPost.status
        })
      } catch (error) {
        console.error('공고 조회 실패:', error)
        alert('공고를 불러오는데 실패했습니다.')
        router.push('/job-posts/my')
      } finally {
        setLoading(false)
      }
    }

    fetchJobPost()
  }, [jobPostId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        router.push('/')
        return
      }

      await axios.put(`/job-posts/${jobPostId}`, formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      alert('공고가 수정되었습니다.')
      router.push(`/job-posts/${jobPostId}`)
    } catch (error) {
      console.error('공고 수정 실패:', error)
      alert('공고 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">채용공고 수정</h1>
            
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

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  상태 *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={JobStatus.SAVED}>저장됨</option>
                  <option value={JobStatus.APPLIED}>지원함</option>
                  <option value={JobStatus.REJECTED}>거절됨</option>
                  <option value={JobStatus.INTERVIEWED}>면접 진행</option>
                  <option value={JobStatus.EXPIRED}>만료됨</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  onClick={() => router.push(`/job-posts/${jobPostId}`)}
                  variant="secondary"
                  size="lg"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  size="lg"
                >
                  {saving ? '수정 중...' : '수정하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 