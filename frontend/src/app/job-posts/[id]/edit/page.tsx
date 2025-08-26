'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from '@/lib/axios'
import { getAccessToken } from '@/lib/auth'
import { JobPostRequestDto, JobPostResponseDto, JobStatus } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'
import FileUpload from '@/components/FileUpload'

import { attachmentService, formatFileSize } from '@/lib/attachment'

export default function EditJobPost() {
  const router = useRouter()
  const params = useParams()
  const jobPostId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jobPost, setJobPost] = useState<JobPostResponseDto | null>(null)
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]) // 삭제 예정 파일들
  const [formData, setFormData] = useState<JobPostRequestDto>({
    companyName: '',
    title: '',
    description: '',
    applyUrl: '',
    closingDateTime: '',
    status: JobStatus.SAVED,
    attachmentIds: []
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

        const jobPostData: JobPostResponseDto = response.data
        setJobPost(jobPostData)
        
        // datetime-local 형식으로 변환
        const closingDateTime = new Date(jobPostData.closingDateTime)
          .toISOString()
          .slice(0, 16)

        setFormData({
          companyName: jobPostData.companyName,
          title: jobPostData.title,
          description: jobPostData.description,
          applyUrl: jobPostData.applyUrl,
          closingDateTime: closingDateTime,
          status: jobPostData.status,
          attachmentIds: []
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

  const handleFilesUploaded = useCallback((attachmentIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      attachmentIds: attachmentIds
    }))
  }, [])

  const handleAttachmentDeleted = (attachmentId: number) => {
    // 삭제 예정 목록에 추가 (실제로는 삭제하지 않음)
    setDeletedAttachmentIds(prev => [...prev, attachmentId])
  }

  // 삭제 취소
  const handleAttachmentRestore = (attachmentId: number) => {
    setDeletedAttachmentIds(prev => prev.filter(id => id !== attachmentId))
  }



  // 다운로드 처리
  const handleDownload = async (attachmentId: number, fileName: string) => {
    try {
      const downloadUrl = await attachmentService.getDownloadUrl(attachmentId)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('파일 다운로드에 실패했습니다.')
    }
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

      // 1. 먼저 삭제 예정인 첨부파일들을 실제로 삭제
      for (const attachmentId of deletedAttachmentIds) {
        try {
          await attachmentService.deleteAttachment(attachmentId)
        } catch (error) {
          console.error(`첨부파일 ${attachmentId} 삭제 실패:`, error)
          // 개별 파일 삭제 실패해도 계속 진행
        }
      }

      // 2. JobPost 업데이트
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

              {/* 기존 첨부파일 목록 */}
              {jobPost?.attachments && jobPost.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">기존 첨부파일</h4>
                  <div className="space-y-2">
                    {jobPost.attachments.map((attachment) => {
                      const isDeleted = deletedAttachmentIds.includes(attachment.id)
                      return (
                        <div 
                          key={attachment.id} 
                          className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                            isDeleted 
                              ? 'bg-red-50 border-red-200 opacity-60' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isDeleted ? 'text-red-700 line-through' : 'text-gray-900'
                              }`}>
                                {attachment.originalName}
                              </p>
                              <p className={`text-xs ${
                                isDeleted ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {formatFileSize(attachment.size)}
                                {isDeleted && ' (삭제 예정)'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!isDeleted && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleDownload(attachment.id, attachment.originalName)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  다운로드
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAttachmentDeleted(attachment.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                            
                            {isDeleted && (
                              <button
                                type="button"
                                onClick={() => handleAttachmentRestore(attachment.id)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                복원
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 새 파일 업로드 */}
              <FileUpload
                onFilesUploaded={handleFilesUploaded}
                existingAttachmentIds={formData.attachmentIds}
                maxFiles={5}
              />

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  onClick={() => {
                    // 삭제 예정 목록 초기화 후 이전 페이지로
                    setDeletedAttachmentIds([])
                    router.push(`/job-posts/${jobPostId}`)
                  }}
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