# Supabase 설정 가이드

## 1) 프로젝트 생성 및 키 복사
Supabase에서 새 프로젝트를 생성한 후 Project Settings → API에서 다음 값을 복사하세요.
- Project URL
- anon public API Key

## 2) .env 파일 생성
프로젝트 루트에 `.env` 파일을 만들고 아래를 입력하세요.

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) 테이블 스키마 생성
Supabase SQL Editor에서 `supabase.sql` 파일 내용을 실행하세요. (시드 좌석 포함)

## 4) 권한/보안 참고
- 지금 정책은 데모용 공개 정책입니다. 운영에서는 반드시 인증/인가 정책으로 강화하세요.
- 관리자 페이지는 서비스 롤 키 또는 RBAC 등으로 보호하는 것을 권장합니다.
