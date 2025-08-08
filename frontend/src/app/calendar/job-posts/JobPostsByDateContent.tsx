'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from '@/lib/axios'
import { JobPostSimpleResponseDto} from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'
import { getStatusColor, getStatusText } from '@/utils/jobStatus'

export default function JobPostsByDateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const [jobPosts, setJobPosts] = useState<JobPostSimpleResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchJobPosts = useCallback(async (date: Date) => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        router.push('/')
        return
      }

      // 해당 날짜의 시작과 끝
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const response = await axios.get('/job-posts/search', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          from: startOfDay.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      })

      setJobPosts(response.data)
    } catch (error) {
      console.error('공고 조회 실패:', error)
      alert('공고를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [router])

  
  useEffect(() => {
    if (!dateParam) return

    // URL 파라미터에서 날짜 파싱 (YYYY-MM-DD 형식)
    const [year, month, day] = dateParam.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month는 0-based
    setSelectedDate(date)

    fetchJobPosts(date)
  }, [dateParam, fetchJobPosts])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getClosingDateCount = () => {
    return jobPosts.filter(post => {
      const closingDate = new Date(post.closingDateTime)
      const targetDate = new Date(selectedDate!)
      return closingDate.toDateString() === targetDate.toDateString()
    }).length
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

  if (!selectedDate) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">날짜를 찾을 수 없습니다</h1>
            <button
              onClick={() => router.push('/calendar')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            >
              달력으로 돌아가기
            </button>
          </div>
        </div>
      </>
    )
  }

  const closingDateCount = getClosingDateCount()

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 공고
                </h1>
                <p className="text-gray-600 mt-2">
                  총 {jobPosts.length}개의 공고가 있습니다
                </p>
              </div>
              <div className="flex space-x-4">
                {closingDateCount > 0 && (
                  <div className="text-red-600 font-semibold">
                    마감일: {closingDateCount}개
                  </div>
                )}
                                 <Button
                  onClick={() => router.push('/calendar')}
                  variant="secondary"
                  size="lg"
                >
                  달력으로 돌아가기
                </Button>
              </div>
            </div>

            {jobPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">이 날짜에는 공고가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobPosts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.companyName}</h3>
                        <p className="text-gray-700 mb-2">{post.title}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">생성일:</span>
                        <p>{formatDate(post.createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-medium">마감일:</span>
                        <p>{formatDate(post.closingDateTime)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                       <Button
                         onClick={() => router.push(`/job-posts/${post.id}`)}
                         variant="info"
                         size="sm"
                       >
                         상세보기
                       </Button>
                       <Button
                         onClick={() => router.push(`/job-posts/${post.id}/edit`)}
                         variant="primary"
                         size="sm"
                       >
                         수정
                       </Button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 