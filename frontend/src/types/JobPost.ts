export enum JobStatus {
  SAVED = 'SAVED', // 기본 상태
  APPLIED = 'APPLIED',
  REJECTED = 'REJECTED',
  INTERVIEWED = 'INTERVIEWED',
  EXPIRED = 'EXPIRED'
}

export interface JobPostRequestDto {
  companyName: string
  title: string
  description: string
  applyUrl: string
  closingDateTime: string // ISO 8601 형식
  status: JobStatus
}

export interface JobPostResponseDto {
  id: number
  companyName: string
  title: string
  description: string
  applyUrl: string
  closingDateTime: string
  status: JobStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface JobPostSimpleResponseDto {
  id: number
  companyName: string
  title: string
  status: JobStatus
  closingDateTime: string
  createdAt: string
  updatedAt: string
}

