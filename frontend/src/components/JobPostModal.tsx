'use client'

import { JobPostSimpleResponseDto } from '@/types/JobPost'
import { getStatusColor, getStatusText } from '@/utils/jobStatus'

interface JobPostModalProps {
  isOpen: boolean
  onClose: () => void
  jobPosts: JobPostSimpleResponseDto[]
  selectedDate: Date
}

export default function JobPostModal({ isOpen, onClose, jobPosts, selectedDate }: JobPostModalProps) {
  if (!isOpen) return null



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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 공고
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {jobPosts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{post.companyName}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                  {getStatusText(post.status)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{post.title}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">생성일:</span>
                  <p>{formatDate(post.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">마감일:</span>
                  <p>{formatDate(post.closingDateTime)}</p>
                </div>
              </div>
              
              {post.attachmentCount && post.attachmentCount > 0 && (
                <div className="mt-3 flex items-center text-sm text-blue-600">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  첨부파일 {post.attachmentCount}개
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
} 