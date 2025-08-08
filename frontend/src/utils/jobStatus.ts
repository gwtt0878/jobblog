import { JobStatus } from '@/types/JobPost'

export const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.SAVED:
      return 'bg-gray-100 text-gray-800'
    case JobStatus.APPLIED:
      return 'bg-blue-100 text-blue-800'
    case JobStatus.REJECTED:
      return 'bg-red-100 text-red-800'
    case JobStatus.INTERVIEWED:
      return 'bg-yellow-100 text-yellow-800'
    case JobStatus.EXPIRED:
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusText = (status: JobStatus) => {
  switch (status) {
    case JobStatus.SAVED:
      return '저장됨'
    case JobStatus.APPLIED:
      return '지원함'
    case JobStatus.REJECTED:
      return '거절됨'
    case JobStatus.INTERVIEWED:
      return '면접 진행'
    case JobStatus.EXPIRED:
      return '만료됨'
    default:
      return status
  }
} 