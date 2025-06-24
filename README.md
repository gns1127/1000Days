# 🎉 1000일 기념 비밀 웹앱

사랑하는 사람과의 **1000일 기념**을 위해 만든 둘만의 추억 저장소 💕  
React와 Supabase를 기반으로 개발되었으며, iOS 앱으로 배포 예정입니다.

---

## ✨ 주요 기능

1. 📸 **사진 업로드**
   - 위치정보 및 촬영시간 자동 추출
   - Supabase Storage에 저장

2. 🗺️ **지도 기반 추억 보기**
   - 사진 위치를 지도에 마커로 표시
   - 지도 검색 및 필터 기능 포함

3. 📅 **날짜 및 위치 필터**
   - 날짜 범위 및 지역 기반 필터링

4. ⭐ **즐겨찾기**
   - 별표 표시로 즐겨찾는 추억 저장

5. 💬 **댓글 기능**
   - 사진별 댓글 작성 및 수정

6. 🔐 **소셜 로그인**
   - 카카오 or 구글 연동 로그인

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React (Vite), Tailwind CSS |
| 백엔드 (BaaS) | Supabase (Auth, Storage, DB) |
| 배포 예정 | iOS (PWA 또는 WebView) |

---

## 📂 프로젝트 구조
```
1000days-app/
├── public/
├── src/
│ ├── assets/ # 이미지 및 정적 파일
│ ├── components/ # 재사용 가능한 UI 컴포넌트
│ ├── pages/ # 페이지 단위 컴포넌트
│ ├── services/ # Supabase 연동 로직
│ ├── utils/ # 유틸 함수
│ └── App.jsx
├── supabase/ # Supabase schema 관리
├── .env
├── index.html
└── README.md
```
