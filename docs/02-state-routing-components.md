# 상태, 라우팅, 컴포넌트 설계

## 상태 구조

MVP에서는 전역 상태를 React state로 관리한다. 새로고침 시 데이터가 사라져도 된다.

```js
const cardData = {
  mainText: "",
  mainImage: null,
  acceptButtonText: "좋아요",
  rejectButtonText: "싫어요",

  acceptImage: null,
  acceptResultText: "",
  acceptReplyEnabled: true,
  acceptReplyText: "",
  acceptReplySubmitted: false,

  rejectImage: null,
  rejectResultText: "",
  rejectReplyEnabled: true,
  rejectReplyText: "",
  rejectReplySubmitted: false,

};
```

## 기본값 및 파생값

공통 표시 로직은 유틸 함수나 hook으로 분리해 중복을 줄인다.

```js
const displayAcceptButtonText =
  cardData.acceptButtonText.trim() || "좋아요";

const displayRejectButtonText =
  cardData.rejectButtonText.trim() || "싫어요";

const finalAcceptMessage =
  cardData.acceptResultText.trim() || displayAcceptButtonText;

const finalRejectMessage =
  cardData.rejectResultText.trim() || displayRejectButtonText;
```

## 라우팅

권장 경로:

```text
/                 HomePage
/create           CreateCardPage
/show             ShowCardPage
/result/accept    AcceptResultPage
/result/reject    RejectResultPage
```

상태는 App 상위에서 들고 페이지에 props로 전달하거나 Context로 제공한다.

MVP에서는 URL 공유나 새로고침 복구가 필요하지 않으므로 localStorage, query string, 서버 저장을 사용하지 않는다.

## 페이지 컴포넌트

```text
src/pages/HomePage.jsx
src/pages/CreateCardPage.jsx
src/pages/ShowCardPage.jsx
src/pages/AcceptResultPage.jsx
src/pages/RejectResultPage.jsx
```

## 공통 컴포넌트

```text
src/components/CardFrame.jsx
src/components/MainQuestionCard.jsx
src/components/ActionButtons.jsx
src/components/ImageUploader.jsx
src/components/ImageBlock.jsx
src/components/ResultMessage.jsx
src/components/ReplyInput.jsx
src/components/ReplyCard.jsx
src/components/ToggleSwitch.jsx
```

## 컴포넌트 책임

### CardFrame

- 모바일 화면처럼 보이는 기본 프레임을 제공한다.
- 데스크톱에서는 중앙 정렬된 모바일 폭 컨테이너 역할을 한다.
- 페이지별 장식이 아니라 실제 앱 화면의 안정적인 레이아웃을 담당한다.

### MainQuestionCard

- `mainImage`와 `mainText`를 화면 중앙에 크게 표시한다.
- 이미지가 없으면 문구만 표시한다.
- ShowCardPage에서 재사용한다.

### ActionButtons

- 수락/거절 버튼을 한 쌍으로 표시한다.
- 버튼 문구는 파생값 `displayAcceptButtonText`, `displayRejectButtonText`를 받는다.
- ShowCardPage에서는 두 버튼 외 불필요한 UI를 표시하지 않는다.

### ImageUploader

- 이미지 파일 선택, 미리보기, 다시 선택, 삭제, 적용하기를 담당한다.
- 수락 후 이미지/QR과 거절 후 이미지에 공통 사용한다.
- 서버 업로드 없이 data URL 또는 object URL을 React state에 저장한다.

### ImageBlock

- 결과 화면과 미리보기에서 이미지를 표시한다.
- 이미지 값이 없으면 `null`을 반환해 빈 공간을 남기지 않는다.

### ResultMessage

- 수락/거절 결과 메시지를 크게 표시한다.
- 이미 계산된 `finalAcceptMessage` 또는 `finalRejectMessage`를 받는다.

### ReplyInput

- 수락 후 답장 입력을 담당한다.
- `acceptReplyEnabled`가 true일 때만 렌더링한다.
- 빈 제출 시 `메시지를 입력해주세요.`를 표시한다.

### ReplyCard

- 수락 결과에서는 `acceptReplySubmitted`가 true일 때 표시한다.
- 거절 결과에서는 `rejectReplySubmitted`가 true일 때 표시한다.
- 상대가 입력한 답장 내용만 카드 안에 크게 표시한다.

### ToggleSwitch

- `acceptReplyEnabled` ON/OFF를 제어한다.
- 모바일 터치에 충분한 크기를 가진다.

## 초기 데이터

```js
const initialCardData = {
  mainText: "",
  mainImage: null,
  acceptButtonText: "좋아요",
  rejectButtonText: "싫어요",
  acceptImage: null,
  acceptResultText: "",
  acceptReplyEnabled: true,
  acceptReplyText: "",
  acceptReplySubmitted: false,
  rejectImage: null,
  rejectResultText: "",
  rejectReplyEnabled: true,
  rejectReplyText: "",
  rejectReplySubmitted: false
};
```
