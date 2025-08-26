'use client'

import { useState, useRef, useEffect } from 'react'
import { attachmentService, formatFileSize, isValidFileType, isValidFileSize } from '@/lib/attachment'
import { FileUploadProgress, AttachmentResponseDto } from '@/types/Attachment'

interface FileUploadProps {
  onFilesUploaded: (attachmentIds: number[]) => void
  existingAttachmentIds?: number[]
  maxFiles?: number
}

export default function FileUpload({ onFilesUploaded, existingAttachmentIds = [], maxFiles = 5 }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadProgress[]>([])
  const [uploadedAttachments, setUploadedAttachments] = useState<AttachmentResponseDto[]>([])
  const [attachmentIds, setAttachmentIds] = useState<number[]>(existingAttachmentIds)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // attachmentIds가 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    onFilesUploaded(attachmentIds)
  }, [attachmentIds, onFilesUploaded])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // 파일 개수 체크
    if (attachmentIds.length + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      return
    }

    // 파일 유효성 검사
    for (const file of files) {
      if (!isValidFileType(file)) {
        alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다.`)
        return
      }
      if (!isValidFileSize(file)) {
        alert(`${file.name}은(는) 파일 크기가 너무 큽니다. (최대 10MB)`)
        return
      }
    }

    // 파일 업로드 시작
    const newUploads: FileUploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      uploaded: false
    }))

    setUploadingFiles(prev => [...prev, ...newUploads])

    // 각 파일을 비동기로 업로드
    const uploadPromises = files.map(async (file) => {
      try {
        // Presigned URL 요청
        const { presignedUrl, storageKey } = await attachmentService.getPresignedUrl(file.name, file.type)

        // 진행률 업데이트
        setUploadingFiles(prev => prev.map((upload) => 
          upload.file === file ? { ...upload, progress: 50, tempKey: storageKey } : upload
        ))

        // S3에 업로드
        await attachmentService.uploadToS3(presignedUrl, file)

        // 업로드 완료 확인
        const attachmentResponse = await attachmentService.confirmUpload({
          storageKey: storageKey,
          originalName: file.name,
          size: file.size,
          contentType: file.type
        })

        // 진행률 100%로 설정
        setUploadingFiles(prev => prev.map(upload => 
          upload.file === file ? { ...upload, progress: 100, uploaded: true } : upload
        ))

        // 업로드된 attachment 추가
        setUploadedAttachments(prev => [...prev, attachmentResponse])
        setAttachmentIds(prev => [...prev, attachmentResponse.id])

      } catch (error) {
        console.error('파일 업로드 실패:', error)
        setUploadingFiles(prev => prev.map(upload => 
          upload.file === file ? { ...upload, error: '업로드 실패' } : upload
        ))
      }
    })

    await Promise.all(uploadPromises)

    // 업로드 완료된 파일들을 목록에서 제거
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(upload => !upload.uploaded))
    }, 2000)

    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (indexToRemove: number) => {
    const newAttachments = uploadedAttachments.filter((_, index) => index !== indexToRemove)
    const newIds = newAttachments.map(att => att.id)
    setUploadedAttachments(newAttachments)
    setAttachmentIds(newIds)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          첨부파일 (선택사항, 최대 {maxFiles}개)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  클릭하여 파일을 선택하거나 드래그 앤 드롭
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  PDF, 이미지, Word 문서 (최대 10MB)
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 업로드 중인 파일들 */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">업로드 중...</h4>
          {uploadingFiles.map((upload, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{upload.file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                </div>
                {upload.error ? (
                  <div className="text-xs text-red-600">{upload.error}</div>
                ) : (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 파일들 */}
      {uploadedAttachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">업로드된 파일</h4>
          {uploadedAttachments.map((attachment, index) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="text-sm font-medium text-green-700">{attachment.originalName}</span>
                  <p className="text-xs text-green-600">{formatFileSize(attachment.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                제거
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
