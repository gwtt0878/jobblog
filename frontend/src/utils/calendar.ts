// 현재 월의 첫날과 마지막날 계산
export const getMonthRange = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  firstDay.setHours(0, 0, 0, 0)

  const lastDay = new Date(year, month + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  return { firstDay, lastDay }
}

// 날짜를 YYYY-MM-DD 형식으로 변환
export const formatDateForAPI = (date: Date) => {
  return date.toISOString().split('T')[0]
}

// 달력 데이터 생성
export const getCalendarDays = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 이전 달의 마지막 날들
  const prevMonthDays = []
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i)
    prevMonthDays.push(prevDate)
  }
  
  // 현재 달의 날들
  const currentMonthDays = []
  for (let i = 1; i <= lastDay.getDate(); i++) {
    currentMonthDays.push(new Date(year, month, i))
  }
  
  // 다음 달의 첫날들
  const nextMonthDays = []
  const lastDayOfWeek = lastDay.getDay()
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    const nextDate = new Date(year, month + 1, i)
    nextMonthDays.push(nextDate)
  }
  
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
} 