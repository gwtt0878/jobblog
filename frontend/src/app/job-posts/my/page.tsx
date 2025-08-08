'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { JobPostSimpleResponseDto } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'
import { getStatusColor, getStatusText } from '@/utils/jobStatus'

export default function MyJobPosts() {
  const router = useRouter()
  const [jobPosts, setJobPosts] = useState<JobPostSimpleResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchMyJobPosts = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          router.push('/')
          return
        }

        const response = await axios.get('/job-posts/my', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        setJobPosts(response.data)
      } catch (error) {
        console.error('내 공고 목록 조회 실패:', error)
        alert('공고 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMyJobPosts()
  }, [router])

  const handleDelete = async (jobPostId: number) => {
    if (!confirm('정말로 이 공고를 삭제하시겠습니까?')) {
      return
    }

    setDeletingId(jobPostId)
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        router.push('/')
        return
      }

      await axios.delete(`/job-posts/${jobPostId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      // 목록에서 삭제된 공고 제거
      setJobPosts(prev => prev.filter(post => post.id !== jobPostId))
      alert('공고가 삭제되었습니다.')
    } catch (error) {
      console.error('공고 삭제 실패:', error)
      alert('공고 삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">내가 올린 공고</h1>
            <Button
              onClick={() => router.push('/job-posts/create')}
              variant="primary"
              size="lg"
            >
              새 공고 등록
            </Button>
          </div>

          {jobPosts.length === 0 ? (
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">등록된 공고가 없습니다.</p>
              <Button
                onClick={() => router.push('/job-posts/create')}
                variant="primary"
                size="lg"
              >
                첫 공고 등록하기
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobPosts.map((jobPost) => (
                <div key={jobPost.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {jobPost.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(jobPost.status)}`}>
                      {getStatusText(jobPost.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{jobPost.companyName}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">마감일:</span> {formatDate(jobPost.closingDateTime)}
                    </div>
                    <div>
                      <span className="font-medium">등록일:</span> {formatDate(jobPost.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => router.push(`/job-posts/${jobPost.id}`)}
                      variant="info"
                      size="md"
                      className="flex-1"
                    >
                      상세보기
                    </Button>
                    <Button
                      onClick={() => router.push(`/job-posts/${jobPost.id}/edit`)}
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(jobPost.id)}
                      disabled={deletingId === jobPost.id}
                      variant="danger"
                      size="md"
                      className="flex-1"
                    >
                      {deletingId === jobPost.id ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
} 