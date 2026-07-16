# 아키텍처, 상태, 컴포넌트 규칙

## 권장 기술 구성

- React + React DOM
- Vite
- React Router DOM 6
- JavaScript/JSX
- 전역 CSS 한 파일

## 권장 디렉터리

```text
src/
  components/
    ActionButtons.jsx
    CardFrame.jsx
    ImageBlock.jsx
    ImageUploader.jsx
    MainQuestionCard.jsx
    ReplyCard.jsx
    ReplyInput.jsx
    ResultMessage.jsx
    ToggleSwitch.jsx
    DeliveryModeCard.jsx
    OnlinePageNav.jsx
  config/
    featureFlags.js
  api/
    onlineCardsApi.js
  data/
    cardData.js
  pages/
    AcceptResultPage.jsx
    CreateCardPage.jsx
    DeliveryModePage.jsx
    HomePage.jsx
    HistoryPage.jsx
    LinkCardCreatePage.jsx
    LinkCardCreatedPage.jsx
    OnlineInboxPage.jsx
    RejectResultPage.jsx
    ShowCardPage.jsx
    SharedCardPage.jsx
  utils/
    cardDisplay.js
    cardStorage.js
    replyHistoryStorage.js
    linkCardHistoryStorage.js
    managementSession.js
  App.jsx
  main.jsx
  styles.css
```

## 상태 모델

```js
export const initialCardData = {
  mainText: "",
  mainImage: null,
  acceptButtonText: "",
  rejectButtonText: "",
  acceptImage: null,
  acceptResultText: "",
  acceptReplyEnabled: true,
  acceptReplyText: "",
  acceptReplySubmitted: false,
  acceptReplyHistoryId: null,
  rejectImage: null,
  rejectResultText: "",
  rejectReplyEnabled: true,
  rejectReplyText: "",
  rejectReplySubmitted: false,
  rejectReplyHistoryId: null
};
```

- `App`이 `cardData`를 소유한다.
- 부분 업데이트는 기존 객체에 변경 필드를 병합한다.
- 앱 시작 시 `cardStorage.js`가 localStorage 저장본을 초기 상태와 병합해 복구한다.
- `cardData`가 변경되면 문구, 이미지 data URL, 답장 설정과 제출 상태를 자동 저장한다.
- 홈의 새 카드 시작은 React 상태와 localStorage를 초기화하고, 기존 카드 시작은 현재 데이터를 유지한다.
- 수락과 거절의 이미지, 결과 문구, 답장 설정과 제출 상태를 섞지 않는다.
- 답장 제출 시 trim된 텍스트와 submitted 상태를 함께 갱신한다.
- 답장 최초 제출은 히스토리 ID를 만들고, 수정 제출은 해당 기록을 갱신한다.
- 답장 초기화는 현재 히스토리 연결을 끊되 이미 저장된 기록은 보존한다.
- 받은 답변은 `gunnam.replyHistory.v1` 키로 카드 데이터와 분리 저장한다.
- 온라인 링크 카드 작성 상태와 서버 응답은 페이지 메모리에만 두고 기존 `cardData` 및 로컬 히스토리와 합치지 않는다.
- 생성 완료 전 관리 URL은 router history state에 저장하지 않는다. 생성 성공 후에는 사용자가 요청한 로컬 링크 히스토리를 위해 검증된 공유·관리 URL을 `gunnam.linkCardHistory.v1`에 최대 50개까지 저장한다.
- 링크 히스토리 삭제는 브라우저 기록만 삭제하며 서버 카드와 받은 답변을 삭제하지 않는다.
- 관리 링크 fragment는 세션 교환 성공 후에만 제거하고, StrictMode 중복 실행은 동일한 교환 작업을 공유한다.
- 응답자 화면에는 작성자 전용 답변함 이동을 노출하지 않으며 온라인 상태 화면에는 공통 홈 이동을 제공한다.
- 온라인 카드의 답변 공개 범위는 서버 `responseVisibility`를 기준으로 렌더링하며, 공유 카드의 공개 결과와 작성자 답변함 DTO를 섞지 않는다.
- 공개 범위 변경 중 답변 제출은 `visibilityAtSubmission` 불일치 시 입력을 유지하고 최신 정책을 다시 조회한다.

## 파생 표시값

`src/utils/cardDisplay.js`에서 다음 값을 계산한다.

```js
displayAcceptButtonText = acceptButtonText.trim() || "좋아요";
displayRejectButtonText = rejectButtonText.trim() || "싫어요";
finalAcceptMessage = acceptResultText.trim() || displayAcceptButtonText;
finalRejectMessage = rejectResultText.trim() || displayRejectButtonText;
```

파생값을 `cardData`에 별도 저장하지 않는다.

## 라우팅

| 경로 | 페이지 | 이동 책임 |
| --- | --- | --- |
| `/` | `HomePage` | 새 카드 시작 → `/create/mode`, 이어 만들기 → `/create` |
| `/create/mode` | `DeliveryModePage` | 직접 건넴 → `/create`, 링크로 건넴 → `/create/link` |
| `/create` | `CreateCardPage` | 최종 검증 성공 → `/show` |
| `/create/link` | `LinkCardCreatePage` | 비회원 링크 카드 생성과 공유·관리 링크 1회 표시 |
| `/c/:shareToken` | `SharedCardPage` | 공유 카드 조회와 수락·거절 답변 제출 |
| `/manage` | `OnlineInboxPage` | fragment 관리 토큰을 세션으로 교환하고 받은 답변 조회 |
| `/history` | `HistoryPage` | 받은 답변 열람·필터·삭제 |
| `/show` | `ShowCardPage` | 수락·거절 결과 선택 |
| `/result/accept` | `AcceptResultPage` | 뒤로가기 → `/show` |
| `/result/reject` | `RejectResultPage` | 뒤로가기 → `/show` |
| `*` | redirect | `/`로 replace |

## 컴포넌트 책임

| 컴포넌트 | 단일 책임 |
| --- | --- |
| `CardFrame` | 모든 화면의 앱 셸과 모바일 프레임 |
| `MainQuestionCard` | 조건부 메인 이미지와 메인 문구 표시 |
| `ActionButtons` | 수락·거절 버튼과 클릭 콜백 |
| `ImageUploader` | 이미지 선택, data URL 변환, 재선택, 삭제 |
| `ImageBlock` | 값이 있을 때만 결과 이미지 표시 |
| `ResultMessage` | 계산된 결과 문구 표시 |
| `ReplyInput` | 로컬 입력, 공백 검증, preview 비활성 모드 |
| `ReplyCard` | 제출된 비어 있지 않은 답장 표시 |
| `ToggleSwitch` | boolean 답장 설정 변경 |
| `DeliveryModeCard` | 건네는 방식 설명과 선택·준비 중 상태 표시 |
| `OnlinePageNav` | 온라인 화면의 홈 이동과 작성자 권한 보유 시 답변함 이동 표시 |

페이지는 흐름과 상태 연결을 담당하고, 재사용 가능한 렌더링과 입력 동작은 컴포넌트로 분리한다.
