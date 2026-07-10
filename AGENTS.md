# 건넴 개발 가이드와 코드 매핑

이 파일은 `PRD.md`를 구현할 때 필요한 상시 작업 지도다. 개발 또는 수정 전에 반드시 관련 문서를 읽고, 실제 파일 구조가 생기거나 바뀌면 이 매핑도 같은 작업에서 갱신한다.

## 문서 참조 순서

| 목적 | 문서 |
| --- | --- |
| 제품 요구사항과 최종 인수 조건 | `PRD.md` |
| 상시 작업 및 변경 관리 규칙 | `docs/00-working-rules.md` |
| MVP 범위와 사용자 흐름 | `docs/01-product-scope.md` |
| 상태, 라우팅, 컴포넌트 책임 | `docs/02-architecture-and-state.md` |
| UI, 문구, 반응형, 접근성 | `docs/03-ui-and-content-rules.md` |
| 테스트와 완료 정의 | `docs/04-testing-and-done.md` |
| 단계별 개발 계획 | `docs/05-development-plan.md` |
| 현재 작업 상태 | `TODO.md` |

## 작업 절차

1. `PRD.md`와 관련 규칙 문서에서 요구사항과 금지 범위를 확인한다.
2. 아래 매핑에서 먼저 볼 파일과 함께 볼 파일을 찾는다.
3. `TODO.md`의 선행 작업과 상태를 확인한다.
4. 구현, 스타일, 접근성, 검증을 함께 처리한다.
5. 빌드 및 관련 수동 시나리오를 확인한다.
6. 실제 완료된 항목만 `TODO.md`에 완료 표시한다.
7. 구조나 책임이 달라졌다면 관련 `docs`와 이 파일을 갱신한다.

## 빠른 코드 매핑

아래 경로는 PRD에 따른 구현 목표다. 페이지, 상태, 라우팅과 공통 컴포넌트 파일이 생성되어 있다.

| 수정하려는 기능 | 먼저 볼 파일 | 함께 볼 파일 |
| --- | --- | --- |
| 앱 진입점과 CSS 연결 | `src/main.jsx` | `index.html`, `src/styles.css` |
| npm 스크립트와 의존성 | `package.json` | `package-lock.json` |
| 전체 라우팅 | `src/App.jsx` | 모든 `src/pages/*.jsx` |
| 전역 카드 상태와 초기화 | `src/App.jsx` | `src/data/cardData.js` |
| 초기 필드 추가·삭제 | `src/data/cardData.js` | `src/App.jsx`, 사용 페이지 |
| 버튼·결과 fallback | `src/utils/cardDisplay.js` | `src/data/cardData.js` |
| 홈 소개 및 새 카드 시작 | `src/pages/HomePage.jsx` | `src/App.jsx` |
| 3단계 작성 흐름 | `src/pages/CreateCardPage.jsx` | `src/styles.css` |
| 메인 문구·이미지 편집 | `src/pages/CreateCardPage.jsx` | `MainQuestionCard.jsx`, `ImageUploader.jsx` |
| 수락·거절 버튼 | `src/components/ActionButtons.jsx` | `ShowCardPage.jsx`, `cardDisplay.js` |
| 수락 결과 작성·표시 | `CreateCardPage.jsx`, `AcceptResultPage.jsx` | `ImageBlock.jsx`, `ResultMessage.jsx` |
| 거절 결과 작성·표시 | `CreateCardPage.jsx`, `RejectResultPage.jsx` | `ImageBlock.jsx`, `ResultMessage.jsx` |
| 이미지 선택·재선택·삭제 | `src/components/ImageUploader.jsx` | `CreateCardPage.jsx` |
| 이미지 조건부 표시 | `src/components/ImageBlock.jsx` | `MainQuestionCard.jsx`, `styles.css` |
| 결과별 답장 설정 | `src/components/ToggleSwitch.jsx` | `CreateCardPage.jsx`, 결과 페이지 |
| 답장 입력·검증 | `src/components/ReplyInput.jsx` | `AcceptResultPage.jsx`, `RejectResultPage.jsx` |
| 제출 답장 표시 | `src/components/ReplyCard.jsx` | 결과 페이지 |
| 모바일 프레임 | `src/components/CardFrame.jsx` | `src/styles.css` |
| 반응형·색상·focus | `src/styles.css` | 관련 JSX 클래스와 aria 속성 |

## 라우팅 지도

```text
/                 HomePage
/create           CreateCardPage
/show             ShowCardPage
/result/accept    AcceptResultPage
/result/reject    RejectResultPage
*                 / 로 replace redirect
```

## cardData 필드 지도

| 필드 | 의미 | 주요 생산자/소비자 |
| --- | --- | --- |
| `mainText` | 메인 질문 문구 | CreateCardPage → MainQuestionCard |
| `mainImage` | 메인 이미지 data URL | ImageUploader → 메인 카드 |
| `acceptButtonText` | 수락 버튼 원본 문구 | CreateCardPage → cardDisplay → ActionButtons |
| `rejectButtonText` | 거절 버튼 원본 문구 | CreateCardPage → cardDisplay → ActionButtons |
| `acceptImage` | 수락 결과 이미지/QR | CreateCardPage → AcceptResultPage |
| `acceptResultText` | 수락 결과 원본 문구 | CreateCardPage → cardDisplay → AcceptResultPage |
| `acceptReplyEnabled` | 수락 답장 노출 여부, 기본 true | CreateCardPage → AcceptResultPage |
| `acceptReplyText` | 제출된 수락 답장 | ReplyInput → ReplyCard |
| `acceptReplySubmitted` | 수락 답장 카드 노출 여부 | AcceptResultPage → ReplyCard |
| `rejectImage` | 거절 결과 이미지 | CreateCardPage → RejectResultPage |
| `rejectResultText` | 거절 결과 원본 문구 | CreateCardPage → cardDisplay → RejectResultPage |
| `rejectReplyEnabled` | 거절 답장 노출 여부, 기본 true | CreateCardPage → RejectResultPage |
| `rejectReplyText` | 제출된 거절 답장 | ReplyInput → ReplyCard |
| `rejectReplySubmitted` | 거절 답장 카드 노출 여부 | RejectResultPage → ReplyCard |

## 핵심 불변 규칙

- 수락 버튼 fallback은 `좋아요`, 거절 버튼 fallback은 `싫어요`다.
- 결과 원본 문구가 비면 해당 버튼의 최종 표시 문구를 사용한다.
- `mainText` 필수 검증은 최종 보여주기에서만 수행한다.
- 답장 토글과 답장 데이터는 수락·거절별로 독립적이다.
- 이미지가 없으면 이미지 요소와 빈 placeholder를 렌더링하지 않는다.
- 이미지는 `object-fit: contain`을 유지한다.
- ShowCardPage에는 응답에 필요한 카드와 버튼 외 불필요한 UI를 넣지 않는다.
- 상태를 서버나 브라우저 저장소에 영속화하지 않는다.
- 모든 사용자 노출 한글 파일은 UTF-8로 저장한다.

## 현재 상태

PRD의 홈, 3단계 작성, 상대 카드, 수락·거절 결과와 독립 답장 흐름이 구현되어 있고 프로덕션 빌드를 통과했다. 다음 작업은 `TODO.md` 6~7절의 브라우저 반응형·접근성·전체 인수 검증이다. 구현 상태는 항상 `TODO.md`를 단일 기준으로 확인한다.
