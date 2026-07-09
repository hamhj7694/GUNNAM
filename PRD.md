# PRD: 건넴 MVP

## 1. 프로젝트 개요

서비스명은 **건넴**이다.

말로 하기 애매한 질문, 부탁, 제안을 작은 카드로 보여주고, 상대가 버튼으로 가볍게 수락하거나 거절할 수 있는 모바일 웹앱이다.

핵심은 상대 정보를 수집하는 것이 아니라, 사용자의 요청을 정중하게 보여주고 상대가 부담 없이 응답하게 만드는 것이다.

---

## 2. 개발 환경

* React
* Vite
* JavaScript
* CSS
* 모바일 우선 반응형 웹

초기 MVP에서는 다음 기능을 만들지 않는다.

* DB
* 로그인
* 회원가입
* 서버 저장
* 위치 정보
* 주변 사람 탐색
* 채팅
* 통계
* 푸시 알림

데이터는 React state로만 관리한다. 새로고침 시 사라져도 된다.

---

## 3. 디자인 참고

`references` 폴더 안의 이미지를 디자인 스타일 참고용으로 사용한다.

주의사항:

* 레퍼런스 이미지는 분위기, 레이아웃, 색감, 카드 스타일만 참고한다.
* 이미지 안에 있는 문구, 콘텐츠, 구체적인 서비스 요소는 사용하지 않는다.
* 최종 UI는 건넴 서비스 목적에 맞게 새로 구성한다.

디자인 방향:

* 심플한 모바일 카드 UI
* 큰 글씨
* 넓은 여백
* 명확한 수락/거절 버튼
* 부담스럽지 않고 조용한 분위기
* 데스크톱에서는 모바일 화면이 중앙에 카드처럼 보이도록 처리

---

## 4. 핵심 기능

사용자는 다음을 만들 수 있어야 한다.

1. 상대에게 보여줄 메인 카드 문구 작성
2. 수락 버튼 문구 설정
3. 거절 버튼 문구 설정
4. 수락 후 표시할 이미지/QR 업로드
5. 수락 후 표시할 짧은 메시지 작성
6. 수락 후 답장 입력 받기 ON/OFF 설정
7. 거절 후 표시할 이미지 업로드
8. 거절 후 표시할 짧은 메시지 작성
9. 카드 미리보기
10. 상대에게 보여줄 카드 화면 전환
11. 상대가 수락/거절 선택
12. 선택 결과 화면 표시
13. 수락 후 답장 입력이 ON이면 답장 카드 생성

---

## 5. 페이지 구조

필요한 페이지:

```text
/pages
- HomePage
- CreateCardPage
- PreviewPage
- ShowCardPage
- AcceptResultPage
- RejectResultPage
```

필요한 컴포넌트:

```text
/components
- CardFrame
- MainQuestionCard
- ActionButtons
- ImageUploader
- ImageBlock
- ResultMessage
- ReplyInput
- ReplyCard
- ToggleSwitch
```

---

## 6. 화면 흐름

```text
HomePage
→ CreateCardPage
→ PreviewPage
→ ShowCardPage
→ AcceptResultPage 또는 RejectResultPage
```

상세 흐름:

```text
[홈]
  ↓
[카드 작성]
  ↓
[미리보기]
  ↓
[상대에게 보여주기]
  ↓
[수락] 또는 [거절]
  ↓
[수락 결과] 또는 [거절 결과]
```

수락 후 답장 입력이 ON이면:

```text
[수락 결과]
→ [답장 입력]
→ [답장 카드 표시]
```

---

## 7. 상태 구조

다음 상태 구조를 기준으로 구현한다.

```js
const cardData = {
  mainText: "",
  acceptButtonText: "좋아요",
  rejectButtonText: "싫어요",

  acceptImage: null,
  acceptMessage: "",
  acceptReplyEnabled: false,

  rejectImage: null,
  rejectMessage: "",

  replyText: "",
  replySubmitted: false
};
```

---

## 8. 기본 표시 규칙

### 메인 카드 문구

`mainText`는 필수값이다.

비어 있으면 미리보기로 이동할 수 없고 아래 에러를 표시한다.

```text
상대에게 보여줄 내용을 적어주세요.
```

### 수락 버튼

수락 버튼 문구가 비어 있으면 `좋아요`를 사용한다.

```js
const displayAcceptButtonText =
  cardData.acceptButtonText.trim() || "좋아요";
```

### 거절 버튼

거절 버튼 문구가 비어 있으면 `싫어요`를 사용한다.

```js
const displayRejectButtonText =
  cardData.rejectButtonText.trim() || "싫어요";
```

### 수락 결과 메시지

수락 후 메시지가 있으면 해당 메시지를 표시한다.

수락 후 메시지가 비어 있으면 수락 버튼 문구를 크게 표시한다.

```js
const finalAcceptMessage =
  cardData.acceptMessage.trim() || displayAcceptButtonText;
```

### 거절 결과 메시지

거절 후 메시지가 있으면 해당 메시지를 표시한다.

거절 후 메시지가 비어 있으면 거절 버튼 문구를 크게 표시한다.

```js
const finalRejectMessage =
  cardData.rejectMessage.trim() || displayRejectButtonText;
```

### 이미지 표시

이미지가 있으면 표시한다.

이미지가 없으면 이미지 영역 자체를 렌더링하지 않는다.

빈 박스, 빈 여백, placeholder가 남으면 안 된다.

---

## 9. 페이지별 요구사항

### HomePage

목적: 서비스 소개와 시작 진입.

구성:

* 서비스명 `건넴`
* 짧은 설명 문구
* `카드 만들기` 버튼
* `예시로 시작하기` 버튼
* `로그인 없이 바로 사용` 안내

동작:

```text
카드 만들기 → CreateCardPage
예시로 시작하기 → 샘플 데이터가 들어간 CreateCardPage
```

샘플 데이터:

```js
const sampleCardData = {
  mainText: "끝나고 같이 밥 먹을래?",
  acceptButtonText: "좋아",
  rejectButtonText: "다음에",
  acceptImage: null,
  acceptMessage: "",
  acceptReplyEnabled: true,
  rejectImage: null,
  rejectMessage: "오케이. 다음에 가자 ㅋㅋ",
  replyText: "",
  replySubmitted: false
};
```

---

### CreateCardPage

목적: 카드 내용 작성.

입력 항목:

* 메인 카드 내용
* 수락 버튼 문구
* 거절 버튼 문구
* 수락 후 이미지/QR
* 수락 후 메시지
* 수락 후 답장 입력 받기 ON/OFF
* 거절 후 이미지
* 거절 후 메시지

하단에 `미리보기` 버튼을 둔다.

메인 카드 내용이 비어 있으면 미리보기 이동을 막는다.

---

### PreviewPage

목적: 상대에게 보여주기 전 확인.

탭 구성:

```text
[메인 카드] [수락 후] [거절 후]
```

버튼:

```text
수정하기 → CreateCardPage
상대에게 보여주기 → ShowCardPage
```

미리보기에서도 실제 표시 규칙을 그대로 적용한다.

* 이미지 없으면 영역 제거
* 메시지 없으면 버튼 문구 표시
* 답장 입력 ON이면 수락 후 화면에 답장 입력 영역 표시

---

### ShowCardPage

목적: 실제로 상대에게 폰을 보여주는 화면.

표시 요소:

* 메인 카드 문구
* 수락 버튼
* 거절 버튼

표시하지 말아야 할 것:

* 수정 버튼
* 홈 버튼
* 뒤로가기 버튼
* 설정 버튼
* 공유 버튼
* 설명 문구
* 기타 불필요한 UI

버튼 동작:

```text
수락 버튼 → AcceptResultPage
거절 버튼 → RejectResultPage
```

---

### AcceptResultPage

목적: 상대가 수락했을 때 보여주는 화면.

표시 요소:

1. 수락 후 이미지/QR

   * 있으면 표시
   * 없으면 영역 제거

2. 수락 결과 메시지

   * 수락 후 메시지가 있으면 해당 메시지 표시
   * 없으면 수락 버튼 문구를 크게 표시

3. 답장 입력

   * `acceptReplyEnabled`가 true일 때만 표시
   * false이면 표시하지 않음

답장 입력 규칙:

* 빈 답장은 제출할 수 없다.
* 빈 답장 제출 시 아래 에러 표시:

```text
메시지를 입력해주세요.
```

답장을 제출하면 `ReplyCard`를 표시한다.

답장은 DB에 저장하지 않고 현재 화면에서만 보여준다.

---

### ReplyCard

목적: 수락 후 상대가 남긴 답장을 카드 형태로 표시.

표시 규칙:

* `replySubmitted`가 true일 때 표시
* 상대가 입력한 답장 내용만 카드 안에 크게 표시
* 이미지/QR 추가 기능은 넣지 않는다
* 새로고침 시 사라져도 된다

예시:

```text
┌────────────────────┐
│                    │
│      답장 카드       │
│                    │
│ 10분 뒤에 갈게       │
│                    │
└────────────────────┘
```

---

### RejectResultPage

목적: 상대가 거절했을 때 보여주는 화면.

표시 요소:

1. 거절 후 이미지

   * 있으면 표시
   * 없으면 영역 제거

2. 거절 결과 메시지

   * 거절 후 메시지가 있으면 해당 메시지 표시
   * 없으면 거절 버튼 문구를 크게 표시

거절 결과 화면에는 입력 기능을 넣지 않는다.

넣지 말아야 할 것:

* 거절 사유 입력
* 거절 후 답장 입력
* 다시 묻기 버튼
* 이유 선택 버튼
* 거절 통계 저장

거절은 짧고 가볍게 끝나야 한다.

---

## 10. ImageUploader 요구사항

이미지 업로드 컴포넌트는 수락 후 이미지/QR, 거절 후 이미지에 공통 사용한다.

기능:

* 이미지 파일 선택
* 선택 이미지 미리보기
* 다시 선택
* 삭제
* 적용하기

이미지는 React state에 저장한다.

초기 MVP에서는 서버 업로드를 구현하지 않는다.

---

## 11. UX 원칙

해야 할 것:

* 상대가 1초 안에 이해할 수 있게 만든다.
* 버튼은 크고 명확하게 보여준다.
* 카드 문구는 화면 중앙에 크게 배치한다.
* 이미지가 없으면 빈 공간을 남기지 않는다.
* 메시지가 없으면 버튼 문구를 결과 메시지로 사용한다.
* 수락한 경우에만 답장 입력을 허용한다.
* 거절은 빠르고 깔끔하게 끝낸다.

하지 말아야 할 것:

* 상대 정보를 저장하지 않는다.
* 위치 정보를 저장하지 않는다.
* 거절 이유를 요구하지 않는다.
* 채팅처럼 만들지 않는다.
* 로그인/회원가입을 요구하지 않는다.
* 통계 기능을 넣지 않는다.
* ShowCardPage에 불필요한 UI를 넣지 않는다.

---

## 12. 구현 우선순위

### 1순위

* React + Vite 프로젝트 구성
* 라우팅 구성
* 전역 cardData 상태 구성
* HomePage
* CreateCardPage
* ShowCardPage
* AcceptResultPage
* RejectResultPage

### 2순위

* PreviewPage
* ImageUploader
* ReplyInput
* ReplyCard
* 조건부 렌더링 정리

### 3순위

* 예시로 시작하기
* 모바일 UI polish
* 카드 전환 애니메이션
* 데스크톱 중앙 모바일 프레임 처리

---

## 13. 완료 기준

다음 조건을 만족하면 MVP 완료로 본다.

* 메인 카드 문구를 작성할 수 있다.
* 메인 카드 문구가 비어 있으면 미리보기로 이동할 수 없다.
* 수락/거절 버튼 문구를 설정할 수 있다.
* 수락 버튼 문구가 비어 있으면 `좋아요`가 표시된다.
* 거절 버튼 문구가 비어 있으면 `싫어요`가 표시된다.
* 수락 후 메시지가 비어 있으면 수락 버튼 문구가 결과 화면에 크게 표시된다.
* 거절 후 메시지가 비어 있으면 거절 버튼 문구가 결과 화면에 크게 표시된다.
* 수락 후 이미지/QR이 있으면 표시되고, 없으면 공간이 제거된다.
* 거절 후 이미지가 있으면 표시되고, 없으면 공간이 제거된다.
* 수락 후 답장 입력 ON일 때만 답장 입력창이 표시된다.
* 답장 제출 후 답장 카드가 표시된다.
* 거절 결과 화면에는 입력 기능이 없다.
* ShowCardPage에는 상대가 눌러야 할 수락/거절 버튼 외 불필요한 UI가 없다.
* 모바일 화면에서 자연스럽게 사용할 수 있다.
