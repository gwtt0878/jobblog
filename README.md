# 📝 JobBlog

> **JobBlog**는 스스로의 개발자 구직 활동을 기록하고 관리할 수 있는 웹 애플리케이션입니다. 

## 🎯 프로젝트 소개

### 주요 기능
- 📅 지원 일정 및 결과 기록
- 💼 이력서 및 포트폴리오 관리
- 🔍 구인 정보 기록 관리

## 🛠️ 개발 스택

### Frontend
- Next.js 15.4.5, TypeScript, Tailwind CSS

### Backend
- Spring Boot 3.5.4, Java 21

### DevOps
- GitHub Actions, AWS EC2

## 개발 환경

### 환경 변수 설정

#### Frontend (.env.developement)
```env
NEXT_PUBLIC_API_URL=
```

#### Backend (application.yml)
```yaml
spring:
  profiles:
    active: dev
  application:
    name: jobblog

cors:
  allowed-origin: 
```

## TODO

- [ ] 사용자 인증 시스템 구현
- [ ] 구인 정보 CRUD 기능
- [ ] 지원 일정 관리 기능
- [ ] 지원 현황 달력
