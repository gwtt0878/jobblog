'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import { JobPostResponseDto } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'
import { getStatusColor, getStatusText } from '@/utils/jobStatus'

export default function JobPostDetail() {
  const router = useRouter()
  const params = useParams()
  const jobPostId = params.id as string
  
  const [jobPost, setJobPost] = useState<JobPostResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          router.push('/')
          return
        }

        const response = await axios.get(`/job-posts/${jobPostId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        setJobPost(response.data)
      } catch (error) {
        console.error('공고 상세 조회 실패:', error)
        alert('공고를 불러오는데 실패했습니다.')
        router.push('/job-posts/my')
      } finally {
        setLoading(false)
      }
    }

    fetchJobPost()
  }, [jobPostId, router])

  const handleDelete = async () => {
    if (!confirm('정말로 이 공고를 삭제하시겠습니까?')) {
      return
    }

    setDeleting(true)
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

      alert('공고가 삭제되었습니다.')
      router.push('/job-posts/my')
    } catch (error) {
      console.error('공고 삭제 실패:', error)
      alert('공고 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
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

  if (!jobPost) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">공고를 찾을 수 없습니다</h2>
            <Button
              onClick={() => router.push('/job-posts/my')}
              variant="info"
              size="lg"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{jobPost.title}</h1>
                <p className="text-xl text-gray-600">{jobPost.companyName}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(jobPost.status)}`}>
                {getStatusText(jobPost.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">공고 정보</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">마감일:</span> {formatDate(jobPost.closingDateTime)}
                  </div>
                  <div>
                    <span className="font-medium">등록자:</span> {jobPost.createdBy}
                  </div>
                  <div>
                    <span className="font-medium">등록일:</span> {formatDate(jobPost.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">수정일:</span> {formatDate(jobPost.updatedAt)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">지원 링크</h3>
                <a
                  href={jobPost.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  지원 페이지로 이동
                </a>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">공고 내용</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{jobPost.description}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => router.push(`/job-posts/${jobPost.id}/edit`)}
                variant="primary"
                size="lg"
              >
                수정
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="danger"
                size="lg"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
              <Button
                onClick={() => router.push('/job-posts/my')}
                variant="info"
                size="lg"
              >
                목록으로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 