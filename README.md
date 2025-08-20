# 📝 JobBlog

> **JobBlog**는 개발자 구직 활동을 체계적으로 기록하고 관리할 수 있는 웹 애플리케이션입니다.

## 🎯 프로젝트 소개

구직 활동 중 지원한 회사와 포지션을 추적하고, 지원 상태를 관리하며, 달력을 통해 지원 일정을 시각화할 수 있습니다.

### 핵심 기능
- 🔐 **Google OAuth 인증**: 간편한 소셜 로그인
- 📋 **구인 정보 관리**: CRUD 기능으로 지원한 회사 정보 저장
- 📊 **지원 상태 추적**: 지원 포지션의 상태 관리
- 📅 **달력 뷰**: 지원 일정과 마감일을 달력으로 시각화

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.4.5** 
- **TypeScript** 
- **Tailwind CSS** 
- **Axios**

### Backend
- **Spring Boot 3.5.4**
- **Java 21**
- **Spring Data JPA**
- **MySQL**

## 📂 프로젝트 구조

### Backend 구조
```
backend/src/main/java/com/gwtt/jobblog/
├── domain/          # 엔티티 클래스
├── controller/      # REST API 컨트롤러
├── service/         # 비즈니스 로직
├── repository/      # 데이터 접근 계층
├── dto/            # 데이터 전송 객체
├── auth/           # JWT 인증 처리
└── config/         # 설정 클래스
```

### Frontend 구조
```
frontend/src/
├── app/            
├── components/     # 재사용 컴포넌트
├── lib/           # 유틸리티 (axios, auth)
├── types/         # TypeScript 타입 정의
└── utils/         # 헬퍼 함수
```

## ✅ 구현 완료된 기능

### 🔐 인증 시스템
- [x] Google OAuth 2.0 로그인
- [x] JWT 액세스 토큰 & 리프레시 토큰
- [x] 로그아웃 처리

### 📋 구인 정보 관리 (JobPost CRUD)
- [x] 구인 정보 등록 (`POST /job-posts`)
- [x] 구인 정보 상세 조회 (`GET /job-posts/{id}`)
- [x] 내 구인 정보 목록 (`GET /job-posts/my`)
- [x] 날짜 범위별 검색 (`GET /job-posts/search`)
- [x] 구인 정보 수정 (`PUT /job-posts/{id}`)
- [x] 구인 정보 삭제 (`DELETE /job-posts/{id}`)

### 📅 달력 기능
- [x] 월별 달력 뷰
- [x] 구인 정보 기간 표시 (생성일~마감일)
- [x] 특정 날짜 구인 정보 조회
- [x] 마감일 카운트 표시

### 🎨 UI/UX
- [x] 네비게이션 바
- [x] 상태별 색상 구분
- [x] 로딩 스피너

## 🚀 개발 환경 설정

### 필요 환경 변수

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=
```

#### Backend (application.yml)
```yaml
spring:
  application:
    name: 

  datasource:
    url: 
    username: 
    password: 

  jpa:
    hibernate:
      ddl-auto: update # 개발 중에는 update 또는 create 사용
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
    show-sql: true

google:
  client-id: your_google_client_id
  client-secret: your_google_client_secret
  redirect-uri: 
  scope:
    - email
    - profile
    - openid

cors:
  allowed-origin: 

client:
  redirect-uri: 

jwt:
  secret-key: 
  secret-refresh-key: 
  issuer: 
  salt:
```

### 실행 방법

#### Backend
```bash
cd backend
./gradlew bootRun
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```