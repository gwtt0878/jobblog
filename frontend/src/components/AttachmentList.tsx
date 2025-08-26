'use client'

import { useState } from 'react'
import { AttachmentResponseDto } from '@/types/Attachment'
import { attachmentService, downloadFile, formatFileSize } from '@/lib/attachment'

interface AttachmentListProps {
  attachments: AttachmentResponseDto[]
  showDownload?: boolean
  showDelete?: boolean
  onAttachmentDeleted?: (attachmentId: number) => void
}

export default function AttachmentList({ 
  attachments, 
  showDownload = true, 
  showDelete = false,
  onAttachmentDeleted 
}: AttachmentListProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleDownload = async (attachment: AttachmentResponseDto) => {
    if (downloadingIds.has(attachment.id)) return

    setDownloadingIds(prev => new Set(prev).add(attachment.id))
    
    try {
      await downloadFile(attachment.id, attachment.originalName)
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('파일 다운로드에 실패했습니다.')
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachment.id)
        return newSet
      })
    }
  }

  const handleDelete = async (attachment: AttachmentResponseDto) => {
    if (!confirm(`${attachment.originalName} 파일을 삭제하시겠습니까?`)) {
      return
    }

    if (deletingIds.has(attachment.id)) return

    setDeletingIds(prev => new Set(prev).add(attachment.id))
    
    try {
      await attachmentService.deleteAttachment(attachment.id)
      onAttachmentDeleted?.(attachment.id)
      alert('파일이 삭제되었습니다.')
    } catch (error) {
      console.error('파일 삭제 실패:', error)
      alert('파일 삭제에 실패했습니다.')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(attachment.id)
        return newSet
      })
    }
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return (
        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      )
    } else if (contentType === 'application/pdf') {
      return (
        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">첨부파일</h4>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(attachment.contentType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {showDownload && (
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingIds.has(attachment.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                >
                  {downloadingIds.has(attachment.id) ? '다운로드 중...' : '다운로드'}
                </button>
              )}
              
              {showDelete && (
                <button
                  onClick={() => handleDelete(attachment)}
                  disabled={deletingIds.has(attachment.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  {deletingIds.has(attachment.id) ? '삭제 중...' : '삭제'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
