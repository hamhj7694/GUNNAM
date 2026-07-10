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
  data/
    cardData.js
  pages/
    AcceptResultPage.jsx
    CreateCardPage.jsx
    HomePage.jsx
    RejectResultPage.jsx
    ShowCardPage.jsx
  utils/
    cardDisplay.js
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
  rejectImage: null,
  rejectResultText: "",
  rejectReplyEnabled: true,
  rejectReplyText: "",
  rejectReplySubmitted: false
};
```

- `App`이 `cardData`를 소유한다.
- 부분 업데이트는 기존 객체에 변경 필드를 병합한다.
- 홈에서 새 카드 시작 시 전체 초기 상태로 재설정한다.
- 수락과 거절의 이미지, 결과 문구, 답장 설정과 제출 상태를 섞지 않는다.
- 답장 제출 시 trim된 텍스트와 submitted 상태를 함께 갱신한다.

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
| `/` | `HomePage` | 새 카드 시작 → `/create` |
| `/create` | `CreateCardPage` | 최종 검증 성공 → `/show` |
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

페이지는 흐름과 상태 연결을 담당하고, 재사용 가능한 렌더링과 입력 동작은 컴포넌트로 분리한다.
