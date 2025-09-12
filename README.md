# KMS 스트림 샘플 앱

KMS API를 실시간 스트리밍 지원과 마크다운 렌더링으로 테스트할 수 있는 React 17.x 기반 웹 애플리케이션입니다.

## 🚀 주요 기능

- **듀얼 API 모드**: 스트리밍(SSE)과 일반(JSON) API 모드 간 전환 가능
- **실시간 스트리밍**: Server-Sent Events(SSE)를 통한 라이브 응답 스트리밍
- **마크다운 렌더링**: GitHub Flavored Markdown 지원으로 아름다운 마크다운 표시
- **요청 히스토리**: 편리한 테스트를 위한 이전 질문 저장 및 재사용
- **증거 자료 표시**: 접을 수 있는 섹션으로 HTML 증거 콘텐츠 렌더링
- **모던 UI**: 탭 스타일 토글 스위치가 있는 깔끔하고 반응형 디자인
- **TypeScript 지원**: 더 나은 개발 경험을 위한 완전한 TypeScript 구현

## 🏗️ 아키텍처

### 컴포넌트
- **KmsApiInput**: Swagger 문서 링크가 있는 API URL 설정
- **QuestionInput**: 요청 히스토리 드롭다운이 있는 사용자 질문 입력
- **StreamResponse**: 채팅 응답의 실시간 마크다운 렌더링
- **EvidenceDisplay**: 확장 가능한 섹션이 있는 HTML 증거 뷰어

### 서비스
- **KmsApiService**: Python dict 파싱으로 스트리밍 및 일반 API 호출 처리
- **StreamParser**: 스트리밍 메시지 처리 및 채팅/증거 콘텐츠 분리

## 🛠️ 시작하기

### 사전 요구사항
- Node.js 16+ 
- npm 또는 yarn

### 설치

1. 저장소 복제:
```bash
git clone https://github.com/lbucess-rage/kms-stream-app.git
cd kms-stream-app
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 서버 시작:
```bash
npm start
```

애플리케이션이 [http://localhost:15700](http://localhost:15700)에서 열립니다.

### 설정

기본 KMS API URL은 `http://10.62.130.84:19001/chat/query`로 미리 설정되어 있습니다. 애플리케이션 UI에서 수정할 수 있습니다.

## 📝 사용법

1. **API URL 설정**: KMS API 엔드포인트 입력 (기본값 제공)
2. **모드 선택**: "일반" (Regular) 또는 "스트림" (Streaming) 모드 선택
3. **질문하기**: 질문을 입력하고 Enter 키를 누르거나 전송 클릭
4. **히스토리 보기**: 이전 질문들이 저장되며 클릭하여 재사용 가능
5. **증거 검토**: 증거 섹션을 확장하여 상세한 지원 정보 확인

## 🔧 API 모드

### 스트리밍 모드 (`stream: true`)
- Server-Sent Events(SSE) 사용
- 실시간 응답 렌더링
- 스트리밍 중단 지원
- 헤더: `Accept: text/event-stream`

### 일반 모드 (`stream: false`)  
- 전통적인 HTTP JSON 응답
- 즉시 완전한 응답
- 헤더: `Accept: application/json`

## 📦 사용 가능한 스크립트

### `npm start`
포트 15700에서 개발 서버를 실행합니다.

### `npm test`
대화형 감시 모드에서 테스트 러너를 시작합니다.

### `npm run build`
프로덕션용으로 앱을 `build` 폴더에 빌드합니다.

### `npm run eject`
**주의: 이는 되돌릴 수 없는 작업입니다!** Create React App에서 분리합니다.

## 🏗️ 기술 스택

- **React 17.x** - 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **TypeScript** - JavaScript의 타입이 있는 상위집합
- **react-markdown** - React용 마크다운 컴포넌트
- **remark-gfm** - GitHub Flavored Markdown 플러그인
- **Create React App** - 빌드 도구체인

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/멋진기능`)
3. 변경사항을 커밋합니다 (`git commit -m '멋진 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/멋진기능`)
5. Pull Request를 엽니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🔗 링크

- **API 문서**: [KMS API 문서](http://10.62.130.84:19001/docs)
- **라이브 데모**: [http://localhost:15700](http://localhost:15700)
- **GitHub 저장소**: [https://github.com/lbucess-rage/kms-stream-app](https://github.com/lbucess-rage/kms-stream-app)

---

🤖 *[Claude Code](https://claude.ai/code)로 생성됨*