import { Suspense } from 'react'
import JobPostsByDateContent from './JobPostsByDateContent'

export default function JobPostsByDate() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <JobPostsByDateContent />
    </Suspense>
  )
} 