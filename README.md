# 🔥 Ignis - 사회적 가치 실현 플랫폼

Ignis는 기부, 펀딩, 봉사 활동을 통합한 사회적 가치 실현 플랫폼입니다. 사용자들이 다양한 사회 공헌 활동에 참여하고, 커뮤니티를 형성하며, 긍정적인 변화를 만들어갈 수 있도록 지원합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [프로젝트 구조](#프로젝트-구조)
- [데이터베이스 구조](#데이터베이스-구조)
- [설치 및 실행](#설치-및-실행)
- [API 엔드포인트](#api-엔드포인트)
- [프로젝트 워크플로우](#프로젝트-워크플로우)
- [보안 기능](#보안-기능)
- [기여하기](#기여하기)

## ✨ 주요 기능

### 1. **기부 (Donation)**
- 기부 프로젝트 등록 및 관리
- 실시간 기부 현황 추적
- 긴급 기부 프로젝트 지원
- 기부 내역 조회 및 관리

### 2. **펀딩 (Funding)**
- 크라우드펀딩 프로젝트 생성
- 리워드 선택 및 결제 시스템
- 펀딩 목표 달성률 추적
- 긴급 펀딩 프로젝트 지원

### 3. **봉사 (Volunteer)**
- 봉사 활동 등록 및 신청
- 참가자 관리 시스템
- 봉사 일정 및 위치 관리
- 긴급 봉사 활동 지원

### 4. **커뮤니티**
- 공지사항 게시판
- 자유게시판
- 댓글 시스템
- 좋아요 및 조회수 기능

### 5. **사용자 관리**
- OAuth2 소셜 로그인
- 회원가입 및 인증
- 마이페이지 (대시보드, 프로필 설정)
- 비밀번호 찾기 (이메일 인증)

### 6. **검색 및 추천**
- 통합 검색 기능
- 카테고리별 검색
- 인기 프로젝트 추천
- 조회수 기반 추천

### 7. **결제 시스템**
- PortOne(Iamport) 결제 연동
- 기부 및 펀딩 결제 처리
- 결제 내역 관리

### 8. **관리자 기능**
- 프로젝트 승인/거부
- 사용자 관리
- 통계 및 대시보드

## 🛠 기술 스택

### Backend
- **Java 17**
- **Spring Boot 3.4.4**
- **Spring Security** (OAuth2 클라이언트)
- **MyBatis 3.0.4**
- **Spring Data JPA**
- **MySQL 8.0**
- **Redis** (캐싱)
- **Spring Mail** (이메일 인증)
- **PortOne API** (결제 시스템)

### Frontend
- **React 19.1.0**
- **Vite 7.0.0**
- **React Router DOM 7.9.6**
- **Ant Design 5.26.3**
- **jQuery 3.7.1**

### Build Tools
- **Gradle** (Backend)
- **npm** (Frontend)

## 🏗 시스템 아키텍처

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Vite + React Router]
    end
    
    subgraph "API Gateway"
        B[Spring Security<br/>OAuth2 + CORS]
    end
    
    subgraph "Application Layer"
        C[Home Controller]
        D[Donation Controller]
        E[Funding Controller]
        F[Volunteer Controller]
        G[User Controller]
        H[Payment Controller]
        I[Search Controller]
        J[Admin Controller]
    end
    
    subgraph "Business Logic Layer"
        K[DonationBO]
        L[FundingBO]
        M[VolunteerBO]
        N[UserBO]
        O[PaymentBO]
        P[SearchBO]
    end
    
    subgraph "Data Access Layer"
        Q[MyBatis Mapper]
        R[JPA Repository]
    end
    
    subgraph "Data Storage"
        S[(MySQL Database)]
        T[(Redis Cache)]
    end
    
    subgraph "External Services"
        U[PortOne API<br/>결제 시스템]
        V[OAuth2 Provider<br/>소셜 로그인]
        W[SMTP Server<br/>이메일 발송]
    end
    
    A -->|HTTP/HTTPS| B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    B --> J
    
    C --> K
    D --> K
    E --> L
    F --> M
    G --> N
    H --> O
    I --> P
    
    K --> Q
    L --> Q
    M --> Q
    N --> R
    O --> U
    P --> Q
    
    Q --> S
    R --> S
    K --> T
    L --> T
    M --> T
    
    N --> V
    N --> W
    
    style A fill:#61dafb
    style B fill:#6db33f
    style S fill:#4479a1
    style T fill:#dc382d
    style U fill:#ff6b6b
```

## 📁 프로젝트 구조

```mermaid
graph LR
    subgraph "Backend Structure"
        A[com.Ignis]
        A --> B[admin<br/>관리자 기능]
        A --> C[comment<br/>댓글 시스템]
        A --> D[common<br/>공통 유틸리티]
        A --> E[config<br/>설정 파일]
        A --> F[home<br/>홈 및 메인 기능]
        A --> G[notice<br/>공지사항]
        A --> H[payment<br/>결제 처리]
        A --> I[post<br/>게시판]
        A --> J[search<br/>검색 기능]
        A --> K[user<br/>사용자 관리]
        
        F --> F1[donation<br/>기부]
        F --> F2[funding<br/>펀딩]
        F --> F3[mypage<br/>마이페이지]
        F --> F4[volunteer<br/>봉사]
    end
    
    subgraph "Frontend Structure"
        L[ignis-frontend]
        L --> L1[src/components<br/>공통 컴포넌트]
        L --> L2[src/pages<br/>페이지 컴포넌트]
        L --> L3[src/styles<br/>스타일시트]
        L --> L4[src/hooks<br/>커스텀 훅]
        
        L2 --> L2A[donation<br/>기부 페이지]
        L2 --> L2B[funding<br/>펀딩 페이지]
        L2 --> L2C[volunteer<br/>봉사 페이지]
        L2 --> L2D[home<br/>홈 페이지]
        L2 --> L2E[mypage<br/>마이페이지]
        L2 --> L2F[noticeboard<br/>공지사항]
        L2 --> L2G[freeboard<br/>자유게시판]
    end
```

## 🗄 데이터베이스 구조

```mermaid
erDiagram
    USER ||--o{ DONATION : creates
    USER ||--o{ FUNDING : creates
    USER ||--o{ VOLUNTEER : creates
    USER ||--o{ POST : creates
    USER ||--o{ NOTICE : creates
    USER ||--o{ COMMENT : writes
    
    DONATION ||--o{ DONATION_PRICE : has
    FUNDING ||--o{ FUNDING_PRICE : has
    VOLUNTEER ||--o{ VOLUNTEER_PEOPLE : has
    
    DONATION {
        bigint donation_id PK
        bigint user_id FK
        string title
        text description
        string account_info
        int max_price
        int current_price
        string status
        string image_path
        boolean emergency
        int view_count
        int like_count
        datetime created_at
        datetime updated_at
    }
    
    FUNDING {
        bigint funding_id PK
        bigint user_id FK
        string title
        text description
        int max_price
        int current_price
        string image_path
        string sub_image_path
        string status
        boolean emergency
        int view_count
        int like_count
        datetime created_at
        datetime updated_at
    }
    
    VOLUNTEER {
        bigint volunteer_id PK
        bigint user_id FK
        string title
        text description
        string location
        string image_path
        datetime start_time
        datetime end_time
        int max_participants
        int current_people
        string status
        boolean emergency
        int view_count
        int like_count
        datetime created_at
        datetime updated_at
    }
    
    USER {
        bigint user_id PK
        string user_login_id UK
        string password
        string name
        string email UK
        string phone_number
        string role
        boolean email_verified
        datetime email_sent
        datetime created_at
    }
    
    POST {
        bigint post_id PK
        bigint user_id FK
        string title
        text content
        string board_type
        int view_count
        int like_count
        datetime created_at
        datetime updated_at
    }
    
    NOTICE {
        bigint notice_id PK
        bigint user_id FK
        string title
        text content
        int view_count
        datetime created_at
        datetime updated_at
    }
    
    COMMENT {
        bigint comment_id PK
        bigint user_id FK
        bigint target_id
        string target_type
        text content
        datetime created_at
        datetime updated_at
    }
    
    DONATION_PRICE {
        bigint donation_price_id PK
        bigint donation_id FK
        bigint user_id FK
        int price
        datetime created_at
    }
    
    FUNDING_PRICE {
        bigint funding_price_id PK
        bigint funding_id FK
        bigint user_id FK
        int price
        datetime created_at
    }
    
    VOLUNTEER_PEOPLE {
        bigint volunteer_people_id PK
        bigint volunteer_id FK
        bigint user_id FK
        datetime created_at
    }
```

## 🚀 설치 및 실행

### 사전 요구사항
- Java 17 이상
- Node.js 18 이상
- MySQL 8.0 이상
- Redis (선택사항)

### Backend 설정

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd ignis1
```

2. **데이터베이스 설정**
   - MySQL 데이터베이스 생성
   - `application.properties` 또는 `application.yml` 파일에 데이터베이스 연결 정보 설정

3. **의존성 설치 및 실행**
```bash
# Gradle Wrapper를 사용하여 실행
./gradlew bootRun

# Windows의 경우
gradlew.bat bootRun
```

### Frontend 설정

1. **프론트엔드 디렉토리로 이동**
```bash
cd ignis-frontend
```

2. **의존성 설치**
```bash
npm install
npm i @ant-design/compatible
npm i react-router-dom
```

3. **개발 서버 실행**
```bash
npm run dev
```

### 프로덕션 빌드

**Frontend 빌드**
```bash
cd ignis-frontend
npm run build
```

빌드된 파일은 `src/main/resources/static` 디렉토리에 자동으로 복사됩니다.

## 📡 API 엔드포인트

### 인증 관련
- `GET /user/me` - 현재 사용자 정보 조회
- `POST /user/signup` - 회원가입
- `POST /user/login` - 로그인
- `POST /user/logout` - 로그아웃
- `GET /oauth2/authorization/{provider}` - OAuth2 로그인

### 기부 관련
- `GET /api/donation/list` - 기부 목록 조회
- `GET /api/donation/{id}` - 기부 상세 조회
- `POST /api/donation/create` - 기부 프로젝트 생성
- `POST /api/donation/payment` - 기부 결제

### 펀딩 관련
- `GET /api/funding/list` - 펀딩 목록 조회
- `GET /api/funding/{id}` - 펀딩 상세 조회
- `POST /api/funding/create` - 펀딩 프로젝트 생성
- `POST /api/funding/payment` - 펀딩 결제

### 봉사 관련
- `GET /api/volunteer/list` - 봉사 목록 조회
- `GET /api/volunteer/{id}` - 봉사 상세 조회
- `POST /api/volunteer/create` - 봉사 활동 생성
- `POST /api/volunteer/{id}/participate` - 봉사 참가

### 검색 관련
- `GET /api/search?keyword={keyword}&type={type}` - 통합 검색

### 홈 관련
- `GET /api/home` - 홈 페이지 데이터 조회
- `GET /api/emergency/check` - 긴급 공지 확인

## 🔄 프로젝트 워크플로우

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant P as PortOne
    
    U->>F: 프로젝트 생성 요청
    F->>B: POST /api/{type}/create
    B->>DB: 프로젝트 정보 저장
    DB-->>B: 저장 완료
    B-->>F: 프로젝트 ID 반환
    F-->>U: 생성 완료
    
    Note over B: 관리자 승인 대기
    
    U->>F: 결제 요청
    F->>B: POST /api/{type}/payment
    B->>P: 결제 요청
    P-->>B: 결제 정보
    B->>DB: 결제 내역 저장
    DB-->>B: 저장 완료
    B-->>F: 결제 완료
    F-->>U: 결제 성공 페이지
```

## 🔐 보안 기능

- Spring Security를 통한 인증/인가
- OAuth2 소셜 로그인 지원
- 비밀번호 SHA-256 해싱
- CORS 설정
- CSRF 보호
- 세션 관리

## 📊 주요 기능 흐름도

```mermaid
flowchart TD
    A[사용자 접속] --> B{로그인 여부}
    B -->|미로그인| C[로그인/회원가입]
    B -->|로그인| D[홈 페이지]
    
    C --> E[OAuth2 로그인]
    C --> F[일반 로그인]
    E --> D
    F --> D
    
    D --> G[기부 목록]
    D --> H[펀딩 목록]
    D --> I[봉사 목록]
    D --> J[게시판]
    D --> K[검색]
    D --> L[마이페이지]
    
    G --> M[기부 상세]
    H --> N[펀딩 상세]
    I --> O[봉사 상세]
    
    M --> P[기부 결제]
    N --> Q[펀딩 결제]
    O --> R[봉사 참가 신청]
    
    P --> S[결제 완료]
    Q --> S
    R --> T[신청 완료]
    
    S --> L
    T --> L
    
    L --> U[내 기부 내역]
    L --> V[내 펀딩 내역]
    L --> W[내 봉사 내역]
    L --> X[프로필 설정]
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 팀

- 개발팀: Ignis Development Team

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Ignis** - 함께 만드는 따뜻한 세상 🔥
