import axios from './axios'
import { getAccessToken } from './auth'
import { PresignedUrlResponse, AttachmentConfirmDto, AttachmentResponseDto } from '@/types/Attachment'

export const attachmentService = {
  // Presigned URL 요청
  async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResponse> {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await axios.post('/attachments/presigned-url', {
      fileName,
      contentType
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return response.data
  },

  // S3에 파일 업로드
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })
  },

  // 업로드 완료 확인
  async confirmUpload(attachmentData: AttachmentConfirmDto): Promise<AttachmentResponseDto> {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await axios.post('/attachments/confirm', attachmentData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return response.data
  },

  // 파일 삭제
  async deleteAttachment(attachmentId: number): Promise<void> {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다.')
    }

    await axios.delete(`/attachments/${attachmentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  },

  // 파일 다운로드 URL 가져오기
  async getDownloadUrl(attachmentId: number): Promise<string> {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await axios.get(`/attachments/${attachmentId}/download-url`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    console.log(response.data);

    return response.data
  }
}

export async function downloadFile(attachmentId: number, fileName: string): Promise<void> {
  const downloadUrl = await attachmentService.getDownloadUrl(attachmentId);

  // S3 presigned URL인 경우 fetch를 사용하여 Bearer 토큰 없이 요청
  const response = await fetch(downloadUrl, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('파일 다운로드에 실패했습니다.')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()

  window.URL.revokeObjectURL(url)
}

// 파일 크기 포맷팅 유틸리티
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 파일 타입 검증
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  return allowedTypes.includes(file.type)
}

// 파일 크기 검증 (최대 10MB)
export const isValidFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return file.size <= maxSize
}
