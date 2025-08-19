'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { getAccessToken } from '@/lib/auth'
import { JobPostSimpleResponseDto, JobStatus } from '@/types/JobPost'
import NavBar from '@/components/NavBar'
import Button from '@/components/Button'
import { MONTH_NAMES, DAY_NAMES } from '@/constants/calendar'
import { getStatusColor, getStatusText } from '@/utils/jobStatus'
import { getMonthRange, formatDateForAPI, getCalendarDays } from '@/utils/calendar'


export default function Calendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [jobPosts, setJobPosts] = useState<JobPostSimpleResponseDto[]>([])
  const [loading, setLoading] = useState(false)

  // 특정 날짜의 공고들 가져오기 (생성일부터 마감일까지 포함)
  const getJobPostsForDate = (date: Date) => {
    return jobPosts.filter(post => {
      const createdDate = new Date(post.createdAt)
      const closingDate = new Date(post.closingDateTime)
      const targetDate = new Date(date)
      
      // 날짜만 비교 (시간 제외)
      const createdDateOnly = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())
      const closingDateOnly = new Date(closingDate.getFullYear(), closingDate.getMonth(), closingDate.getDate())
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      
      return targetDateOnly >= createdDateOnly && targetDateOnly <= closingDateOnly
    })
  }

  // 특정 날짜의 마감일 개수 계산
  const getClosingDateCount = (date: Date) => {
    return jobPosts.filter(post => {
      const closingDate = new Date(post.closingDateTime)
      const targetDate = new Date(date)
      
      // 날짜만 비교 (시간 제외)
      const closingDateOnly = new Date(closingDate.getFullYear(), closingDate.getMonth(), closingDate.getDate())
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      
      return closingDateOnly.getTime() === targetDateOnly.getTime()
    }).length
  }

  // 월 변경
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // 공고 데이터 가져오기 (이전/다음 달 포함)
  const fetchJobPosts = useCallback(async (from: Date, to: Date) => {
    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        router.push('/')
        return
      }

      // 이전 달과 다음 달을 포함한 범위로 검색
      const extendedFrom = new Date(from)
      extendedFrom.setDate(from.getDate() - 7)
      extendedFrom.setHours(0, 0, 0, 0)

      const extendedTo = new Date(to)
      extendedTo.setDate(to.getDate() + 7)
      extendedTo.setHours(23, 59, 59, 999)

      const response = await axios.get('/job-posts/search', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          from: formatDateForAPI(extendedFrom),
          to: formatDateForAPI(extendedTo)
        }
      })

      setJobPosts(response.data)
    } catch (error) {
      console.error('공고 조회 실패:', error)
      alert('공고를 불러오는데 실패했습니다.')
    }
  }, [router])


  useEffect(() => {
    const { firstDay, lastDay } = getMonthRange(currentDate)
    setLoading(true)
    fetchJobPosts(firstDay, lastDay).finally(() => setLoading(false))
  }, [currentDate, fetchJobPosts])



  const calendarDays = getCalendarDays(currentDate)

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">공고 일정</h1>
                             <div className="flex space-x-4">
                 <Button
                   onClick={() => changeMonth('prev')}
                   variant="secondary"
                   size="md"
                 >
                   이전 달
                 </Button>
                 <span className="px-4 py-2 text-lg font-semibold">
                   {currentDate.getFullYear()}년 {MONTH_NAMES[currentDate.getMonth()]}
                 </span>
                 <Button
                   onClick={() => changeMonth('next')}
                   variant="secondary"
                   size="md"
                 >
                   다음 달
                 </Button>
               </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* 요일 헤더 */}
                {DAY_NAMES.map((day: string) => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-700 bg-gray-100">
                    {day}
                  </div>
                ))}
                
                {/* 달력 날짜들 */}
                {calendarDays.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayJobPosts = getJobPostsForDate(date)
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border border-gray-200 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`text-sm p-1 font-medium ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-green-600 bg-green-200 rounded-full' : ''}`}>
                        {date.getDate()}
                      </div>
                      
                                             <div className="mt-1 space-y-1">
                         {/* 마감일 개수 표시 */}
                         {getClosingDateCount(date) > 0 && (
                           <div className="text-xs text-red-600 font-semibold text-right">
                             마감일: {getClosingDateCount(date)}개
                           </div>
                         )}
                         
                                                   {/* 공고 개수 버튼 */}
                          {dayJobPosts.length > 0 && (
                            <div 
                              className="text-xs text-blue-600 text-center cursor-pointer hover:bg-blue-50 p-1 rounded border border-blue-200 bg-blue-50"
                              onClick={() => router.push(`/calendar/job-posts?date=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)}
                            >
                              {dayJobPosts.length}개 공고
                            </div>
                          )}
                       </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 상태별 색상 설명 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">상태별 색상</h3>
              <div className="flex flex-wrap gap-3">
                {Object.values(JobStatus).map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
} 