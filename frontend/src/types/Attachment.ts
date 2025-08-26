// 첨부파일 관련 타입 정의
export interface AttachmentResponseDto {
  id: number
  originalName: string
  contentType: string
  size: number
}

export interface AttachmentConfirmDto {
  storageKey: string
  originalName: string
  contentType: string
  size: number
}

export interface PresignedUrlResponse {
  presignedUrl: string
  storageKey: string
}

export interface FileUploadProgress {
  file: File
  progress: number
  uploaded: boolean
  error?: string
  tempKey?: string
}
