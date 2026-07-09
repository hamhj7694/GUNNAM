# 건넴 코드 매핑 가이드

나중에 기능을 수정할 때 필요한 파일을 빠르게 찾기 위한 작업 지도다.

## 빠른 색인

| 수정하고 싶은 것 | 먼저 볼 파일 | 같이 볼 파일 |
| --- | --- | --- |
| 앱 시작점, React 마운트 | `src/main.jsx` | `index.html` |
| npm 스크립트와 의존성 | `package.json` |  |
| 전체 라우팅 경로 | `src/App.jsx` | `react-router-dom` |
| 전역 카드 상태 | `src/App.jsx` | `src/data/cardData.js` |
| 기본 상태값 추가/삭제 | `src/data/cardData.js` | `src/App.jsx` |
| 버튼/결과 메시지 fallback | `src/utils/cardDisplay.js` | `src/data/cardData.js` |
| 홈 화면 문구/버튼 | `src/pages/HomePage.jsx` | `src/styles.css` |
| 카드 만들기 시작 동작 | `src/pages/HomePage.jsx` | `src/App.jsx` |
| 3단계 작성 흐름 | `src/pages/CreateCardPage.jsx` | `src/styles.css` |
| 작성 단계 탭/이전/다음 | `src/pages/CreateCardPage.jsx` | `.step-tabs`, `.bottom-actions` |
| 메인 카드 문구 입력 | `src/pages/CreateCardPage.jsx` | `.editable-question-card` |
| 메인 카드 이미지 업로드 | `src/pages/CreateCardPage.jsx` | `src/components/ImageUploader.jsx` |
| 메인 카드 실제 표시 | `src/components/MainQuestionCard.jsx` | `src/pages/ShowCardPage.jsx` |
| 메인 카드 이미지 안 잘리게 표시 | `src/styles.css` | `.question-card img` |
| 수락/거절 버튼 표시 | `src/components/ActionButtons.jsx` | `src/utils/cardDisplay.js` |
| 작성 중 수락/거절 버튼 문구 수정 | `src/pages/CreateCardPage.jsx` | `.editable-action-buttons`, `.button-input` |
| 수락 페이지 작성 단계 | `src/pages/CreateCardPage.jsx` | `src/pages/AcceptResultPage.jsx` |
| 거절 페이지 작성 단계 | `src/pages/CreateCardPage.jsx` | `src/pages/RejectResultPage.jsx` |
| 결과 이미지 조건부 표시 | `src/components/ImageBlock.jsx` | `src/styles.css` |
| 결과 메시지 표시 | `src/components/ResultMessage.jsx` | `src/utils/cardDisplay.js` |
| 수락 후 답장 입력 | `src/components/ReplyInput.jsx` | `src/pages/AcceptResultPage.jsx` |
| 답장 카드 표시 | `src/components/ReplyCard.jsx` | `src/pages/AcceptResultPage.jsx` |
| 답장 받기 ON/OFF | `src/components/ToggleSwitch.jsx` | `src/pages/CreateCardPage.jsx` |
| 상대에게 보여주는 화면 | `src/pages/ShowCardPage.jsx` | `src/components/MainQuestionCard.jsx` |
| 수락 결과 화면 | `src/pages/AcceptResultPage.jsx` | `src/components/ReplyInput.jsx` |
| 거절 결과 화면 | `src/pages/RejectResultPage.jsx` | `src/components/ResultMessage.jsx` |
| 상대 화면 뒤로가기 버튼 | `src/pages/ShowCardPage.jsx`, `src/pages/AcceptResultPage.jsx`, `src/pages/RejectResultPage.jsx` | `.screen-back-button` |
| 모바일 프레임/전체 톤 | `src/styles.css` | `src/components/CardFrame.jsx` |

## 현재 사용자 흐름

```text
HomePage
→ CreateCardPage
  → 1단계: 메인 카드 작성
  → 2단계: 수락 페이지 작성
  → 3단계: 거절 페이지 작성
→ ShowCardPage
→ AcceptResultPage 또는 RejectResultPage
```

`PreviewPage`와 `예시로 시작하기`는 제거된 상태다. `CreateCardPage` 자체가 작성 화면이자 미리보기 화면이다.

## 라우팅

`src/App.jsx`에서 관리한다.

```text
/                 HomePage
/create           CreateCardPage
/show             ShowCardPage
/result/accept    AcceptResultPage
/result/reject    RejectResultPage
*                 / 로 redirect
```

## cardData 필드 매핑

`src/data/cardData.js`의 `initialCardData`가 기준이다.

| 필드 | 의미 | 주로 수정/사용하는 파일 |
| --- | --- | --- |
| `mainText` | 상대에게 보여줄 메인 카드 문구 | `CreateCardPage.jsx`, `MainQuestionCard.jsx`, `ShowCardPage.jsx` |
| `mainImage` | 메인 카드 이미지 | `CreateCardPage.jsx`, `MainQuestionCard.jsx`, `styles.css` |
| `acceptButtonText` | 수락 버튼 문구 | `CreateCardPage.jsx`, `ActionButtons.jsx`, `cardDisplay.js` |
| `rejectButtonText` | 거절 버튼 문구 | `CreateCardPage.jsx`, `ActionButtons.jsx`, `cardDisplay.js` |
| `acceptImage` | 수락 후 이미지/QR | `CreateCardPage.jsx`, `AcceptResultPage.jsx`, `ImageBlock.jsx` |
| `acceptResultText` | 수락 결과 카드 안에서 직접 수정하는 문구 | `CreateCardPage.jsx`, `AcceptResultPage.jsx`, `cardDisplay.js` |
| `acceptReplyEnabled` | 수락 후 답장 입력 표시 여부. 기본 ON | `CreateCardPage.jsx`, `AcceptResultPage.jsx`, `ToggleSwitch.jsx` |
| `acceptReplyText` | 수락 후 상대가 남긴 답장 | `AcceptResultPage.jsx`, `ReplyInput.jsx`, `ReplyCard.jsx` |
| `acceptReplySubmitted` | 수락 후 답장 카드 표시 여부 | `AcceptResultPage.jsx`, `ReplyCard.jsx` |
| `rejectImage` | 거절 후 이미지 | `CreateCardPage.jsx`, `RejectResultPage.jsx`, `ImageBlock.jsx` |
| `rejectResultText` | 거절 결과 카드 안에서 직접 수정하는 문구 | `CreateCardPage.jsx`, `RejectResultPage.jsx`, `cardDisplay.js` |
| `rejectReplyEnabled` | 거절 후 답장 입력 표시 여부. 기본 ON | `CreateCardPage.jsx`, `RejectResultPage.jsx`, `ToggleSwitch.jsx` |
| `rejectReplyText` | 거절 후 상대가 남긴 답장 | `RejectResultPage.jsx`, `ReplyInput.jsx`, `ReplyCard.jsx` |
| `rejectReplySubmitted` | 거절 후 답장 카드 표시 여부 | `RejectResultPage.jsx`, `ReplyCard.jsx` |

## 표시 규칙

`src/utils/cardDisplay.js`에서 계산한다.

- 수락 버튼 문구가 비어 있으면 `좋아요`
- 거절 버튼 문구가 비어 있으면 `싫어요`
- 버튼 입력칸은 초기값이 비어 있고, 비어 있으면 기본값으로 표시한다.
- 작성 중 버튼/결과 문구 placeholder는 `좋아요(직접 입력해보세요)`, `싫어요(직접 입력해보세요)`를 사용한다.
- 수락 결과 메시지는 `acceptResultText`가 있으면 해당 문구, 없으면 수락 버튼 문구
- 거절 결과 메시지는 `rejectResultText`가 있으면 해당 문구, 없으면 거절 버튼 문구

이미지 조건부 렌더링:

- 메인 카드 이미지는 `MainQuestionCard.jsx`와 `CreateCardPage.jsx`에서 이미지가 있을 때만 표시한다.
- 결과 이미지는 `ImageBlock.jsx`가 담당한다.
- 이미지가 없으면 `null`을 반환하거나 렌더링하지 않아 빈 공간을 남기지 않는다.

## 파일별 책임

### 루트

- `package.json`
  - `npm run dev`, `npm run build`, `npm run preview`
  - React, Vite, React Router 의존성
- `index.html`
  - Vite HTML 진입점
  - `#root` 제공
- `src/main.jsx`
  - React 앱을 `#root`에 렌더링
  - `src/styles.css` import
- `src/App.jsx`
  - 전역 `cardData` state 관리
  - `setCardData` 병합 업데이트 함수 제공
  - `BrowserRouter`, `Routes`, `Route` 구성
  - 각 페이지에 `cardData`, `display`, `setCardData`, `resetCardData` 전달

### 데이터와 유틸

- `src/data/cardData.js`
  - `initialCardData` 정의
  - 새 필드를 추가할 때 가장 먼저 수정
- `src/utils/cardDisplay.js`
  - 버튼 기본값과 결과 메시지 fallback 계산
  - 표시 문구 규칙을 바꾸려면 여기 수정

### 페이지

- `src/pages/HomePage.jsx`
  - 첫 화면
  - 서비스명 `건넴`
  - `카드 만들기` 버튼
  - 클릭 시 `resetCardData()` 후 `/create` 이동
- `src/pages/CreateCardPage.jsx`
  - 3단계 작성형 미리보기 화면
  - 메인 카드, 수락 페이지, 거절 페이지 작성
  - 메인 단계에서는 수락/거절 버튼 모양 입력에서 문구를 직접 수정
  - `mainText` 필수 검증
  - 마지막 단계에서 `/show` 이동
- `src/pages/ShowCardPage.jsx`
  - 실제 상대에게 보여주는 화면
  - 메인 이미지/문구와 수락/거절 버튼만 표시
  - 좌측 상단 작은 화살표 버튼으로 `/create` 이동
  - 수락 클릭 시 `/result/accept`
  - 거절 클릭 시 `/result/reject`
- `src/pages/AcceptResultPage.jsx`
  - 수락 결과 화면
  - 수락 이미지/QR, 수락 결과 메시지를 `.result-preview` 카드 안에 표시
  - `acceptReplyEnabled`가 true일 때만 답장 입력 표시
  - 답장 제출 시 `acceptReplyText`, `acceptReplySubmitted` 업데이트
  - 좌측 상단 작은 화살표 버튼으로 `/show` 이동
  - 답장 제출 후 ReplyCard를 답장 입력 폼 위에 표시
- `src/pages/RejectResultPage.jsx`
  - 거절 결과 화면
  - 거절 이미지와 거절 결과 메시지를 `.result-preview` 카드 안에 표시
  - `rejectReplyEnabled`가 true일 때만 답장 입력 표시
  - 답장 제출 시 `rejectReplyText`, `rejectReplySubmitted` 업데이트
  - 좌측 상단 작은 화살표 버튼으로 `/show` 이동
  - 거절 사유 입력, 다시 묻기 흐름을 넣지 않는다.

### 컴포넌트

- `src/components/CardFrame.jsx`
  - 모든 페이지의 모바일 프레임
  - `.app-shell`, `.phone-frame` 스타일 사용
- `src/components/MainQuestionCard.jsx`
  - ShowCardPage의 메인 카드 표시
  - `image`가 있으면 이미지 표시, 없으면 문구만 표시
- `src/components/ActionButtons.jsx`
  - 수락/거절 버튼 쌍
  - `acceptText`, `rejectText`, `onAccept`, `onReject` props 사용
- `src/components/ImageUploader.jsx`
  - 이미지 선택 즉시 적용, 선택 상태 표시, 다시 선택, 삭제
  - 삭제 버튼은 이미지가 있을 때 하단 액션 영역의 오른쪽에 표시
  - 서버 업로드 없이 FileReader data URL을 state로 전달
- `src/components/ImageBlock.jsx`
  - 결과 이미지 표시
  - 이미지가 없으면 `null`
- `src/components/ResultMessage.jsx`
  - 수락/거절 결과 메시지 표시
- `src/components/ReplyInput.jsx`
  - 수락/거절 후 답장 입력 폼
  - 라벨 문구: `하고 싶은 말을 남겨주세요`
  - 빈 답장 제출 시 `메시지를 입력해주세요.`
  - 작성 화면 미리보기에서는 `preview` prop으로 입력과 제출을 막는다.
- `src/components/ReplyCard.jsx`
  - 제출된 답장을 카드로 표시
- `src/components/ToggleSwitch.jsx`
  - 수락 후 답장 입력 받기 ON/OFF

## CreateCardPage 내부 지도

`src/pages/CreateCardPage.jsx` 안에서 찾으면 된다.

- `steps`: 작성 단계 정의
  - `main`: 메인 카드 작성
  - `accept`: 수락 페이지 작성
  - `reject`: 거절 페이지 작성
- `stepIndex`: 현재 작성 단계
- `error`: 메인 문구 검증 에러
- `updateField(field, value)`: `cardData` 일부 필드 업데이트
- `validateMainCard()`: 최종 제출 시 `mainText` 필수 검증
- `goNext()`: 검증 없이 다음 단계 이동
- `goPrevious()`: 첫 단계에서는 `/` 홈 이동, 그 외에는 이전 단계 이동
- `showCard()`: 검증 후 `/show` 이동
- 단계 네비게이션 버튼: 검증 없이 해당 단계로 즉시 이동
- 중간 이동은 자유롭게 허용하고, 누락 안내는 최종 `상대에게 보여주기`에서만 처리

단계별 렌더링 위치:

- `step.id === "main"`
  - 메인 카드 이미지
  - 카드 안 textarea
  - 수락/거절 버튼 문구를 버튼 모양 input에서 직접 수정
- `step.id === "accept"`
  - 수락 결과 미리보기
  - 수락 결과 문구를 카드 안 textarea에서 직접 수정
  - 수락 이미지/QR 업로더
  - 답장 입력 토글. 기본 ON
- `step.id === "reject"`
  - 거절 결과 미리보기
  - 거절 결과 문구를 카드 안 textarea에서 직접 수정
  - 거절 이미지 업로더
  - 답장 입력 토글. 기본 ON

## 스타일 클래스 매핑

`src/styles.css`에서 관리한다.

| 클래스 | 역할 | 관련 파일 |
| --- | --- | --- |
| `.app-shell` | 전체 배경과 중앙 정렬 | `CardFrame.jsx` |
| `.phone-frame` | 모바일 앱 프레임 | `CardFrame.jsx` |
| `.home-page` | 홈 화면 세로 정렬 | `HomePage.jsx` |
| `.home-content` | 홈 텍스트 묶음 | `HomePage.jsx` |
| `.home-actions` | 홈 버튼 영역 | `HomePage.jsx` |
| `.page-header` | 작성 화면 상단 제목 | `CreateCardPage.jsx` |
| `.step-tabs` | 3단계 작성 탭 | `CreateCardPage.jsx` |
| `.creator-step` | 작성 단계별 컨테이너 | `CreateCardPage.jsx` |
| `.screen-preview` | 상대에게 보일 화면 영역 | `CreateCardPage.jsx` |
| `.edit-controls` | 작성자가 수정하는 입력 영역 | `CreateCardPage.jsx` |
| `.section-label` | 상대 화면 영역 라벨 | `CreateCardPage.jsx` |
| `.question-card` | 메인 카드 UI | `MainQuestionCard.jsx`, `CreateCardPage.jsx` |
| `.question-card img` | 메인 이미지 비율 유지 표시 | `MainQuestionCard.jsx`, `CreateCardPage.jsx` |
| `.editable-question-card` | 작성 가능한 메인 카드 | `CreateCardPage.jsx` |
| `.action-buttons` | 수락/거절 버튼 묶음 | `ActionButtons.jsx` |
| `.editable-action-buttons` | 작성 중 수락/거절 버튼 문구 입력 묶음 | `CreateCardPage.jsx` |
| `.button-input` | 버튼처럼 보이는 문구 입력 필드 | `CreateCardPage.jsx` |
| `.uploader` | 이미지 업로더 전체 | `ImageUploader.jsx` |
| `.uploader-status` | 업로드 이미지 선택 상태 표시 | `ImageUploader.jsx` |
| `.result-preview` | 작성 중 수락/거절 결과 미리보기 | `CreateCardPage.jsx` |
| `.accept-preview` | 수락 결과의 파란 톤 카드 | `CreateCardPage.jsx`, `AcceptResultPage.jsx` |
| `.accept-context` | 수락 작성/결과 화면의 버튼과 포커스 파란 톤 | `CreateCardPage.jsx`, `AcceptResultPage.jsx` |
| `.reject-preview` | 거절 결과의 붉은 톤 카드 | `CreateCardPage.jsx`, `RejectResultPage.jsx` |
| `.reject-context` | 거절 작성/결과 화면의 버튼과 포커스 붉은 톤 | `CreateCardPage.jsx`, `RejectResultPage.jsx` |
| `.image-block` | 결과 이미지 표시 영역 | `ImageBlock.jsx` |
| `.result-message` | 수락/거절 결과 메시지 | `ResultMessage.jsx` |
| `.screen-back-button` | 상대 화면/결과 화면 좌측 상단 뒤로가기 버튼 | `ShowCardPage.jsx`, `AcceptResultPage.jsx`, `RejectResultPage.jsx` |
| `.reply-input` | 답장 입력 폼 | `ReplyInput.jsx` |
| `.reply-card` | 제출된 답장 카드 | `ReplyCard.jsx` |
| `.toggle-row`, `.toggle-switch` | 답장 받기 토글 | `ToggleSwitch.jsx` |
| `.bottom-actions` | 이전/다음/보여주기 버튼 영역 | `CreateCardPage.jsx` |
| `.button-accept` | 주요 액션 버튼 | 여러 페이지 |
| `.button-reject` | 거절 버튼 | `ActionButtons.jsx` |
| `.ghost-button` | 보조 버튼 | `CreateCardPage.jsx` |

## 작업 시 주의사항

- MVP에서는 DB, 로그인, 서버 저장, 위치 정보, 채팅, 통계, 푸시 알림을 추가하지 않는다.
- 상태는 React state로만 관리하고 새로고침 복구를 구현하지 않는다.
- ShowCardPage에는 상대가 눌러야 할 수락/거절 버튼 외 불필요한 UI를 넣지 않는다.
- 거절 결과 화면에는 입력 기능이나 다시 묻기 흐름을 넣지 않는다.
- 이미지가 없으면 placeholder나 빈 박스를 남기지 않는다.
- 메인 카드 이미지는 가능한 한 잘리지 않게 `object-fit: contain` 기준을 유지한다.
- 결과 메시지가 비어 있으면 버튼 문구 fallback 규칙을 유지한다.
