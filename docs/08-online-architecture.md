# 온라인 확장 아키텍처 초안

- 상태: D3 검토 초안
- 작성일: 2026-07-15
- 기준: `docs/06-online-expansion-rfc.md`, `docs/07-online-implementation-plan.md`

## 1. 시스템 경계

```text
React SPA
  ├─ Direct feature → React state + localStorage
  └─ Online feature → Online API adapter
                         ↓
                    Online API
                    ├─ domain rules
                    ├─ token/capability service
                    ├─ authorization projections
                    ├─ idempotency/rate limit
                    └─ repository ports
                         ↓
              Relational DB + Object Storage + Auth Adapter
```

- `direct`는 현재 상태와 localStorage 키를 유지한다.
- `link/public`만 온라인 API와 서버 모델을 사용한다.
- localStorage 히스토리 validator와 온라인 응답 validator를 공유하지 않는다.
- 특정 DB·인증·스토리지 SDK는 domain과 프론트 UI에 직접 의존시키지 않는다.

## 2. 저장소 구조 제안

```text
contracts/
  openapi.yaml
  examples/
server/
  src/
    domain/cards/
    domain/responses/
    http/
    ports/
    adapters/
  sql/
    gunnam_minimum_schema.sql
  tests/unit/
  tests/integration/
  tests/contract/
src/
  api/
  config/features.js
  features/online/
  fixtures/
```

현재 SPA를 즉시 monorepo의 `apps/web`으로 이동하지 않는다. 서버 런타임과 배포 방식이 확정된 뒤 필요성을 다시 판단한다.

## 3. 핵심 데이터 모델

### OnlineCard

```js
{
  id,
  ownerUserId: null,
  deliveryMode: "link", // link | public
  responseVisibility: "owner_only",
  responseStatus: "open", // open | closed
  shareTokenDigest,
  shareTokenVersion,
  managementTokenDigest,
  questionText,
  acceptText,
  rejectText,
  acceptResultText,
  rejectResultText,
  createdAt,
  updatedAt,
  claimedAt: null,
  closedAt: null,
  deletedAt: null,
  rowVersion
}
```

### OnlineResponse

```js
{
  id,
  cardId,
  responseType: "accept", // accept | reject
  nickname: null,
  replyText: null,
  publicConsent: false,
  visibilityAtSubmission: "owner_only",
  editTokenDigest: null,
  clientSessionDigest: null,
  createdAt,
  updatedAt,
  deletedAt: null,
  rowVersion
}
```

- `responseType`은 필수다.
- 추가 의견 `replyText`는 trim 후 빈 문자열을 `null`로 저장한다.
- `nickname`, 동의, 수정 토큰 필드는 정책 단계에 따라 활성화한다.
- 초기 집계는 응답 테이블에서 계산하고 실제 성능 문제 후 별도 집계를 고려한다.

## 4. 토큰과 관리 권한

| 토큰 | 권한 | 저장 원칙 |
| --- | --- | --- |
| Share token | 카드 공개 조회·답변 제출 | DB에는 digest만 저장 |
| Management token | 카드 설정·전체 답변·삭제·마감·회전 | DB에는 digest만 저장 |
| Edit token | 특정 응답 수정 | DB에는 digest만 저장 |

- 토큰은 목적과 네임스페이스를 분리한다.
- 최소 128-bit 이상의 예측 불가능한 값을 사용한다.
- 관리 토큰은 URL fragment로 최초 전달하고 관리 세션으로 교환하는 방식을 우선 검토한다.
- 관리 토큰 원문은 로그·분석·오류 추적·Referer에 포함하지 않는다.
- 계정 귀속 후 관리 토큰 폐기 여부는 D4 결정이다.

## 5. 권한 projection

| 요청자·설정 | 서버 반환 |
| --- | --- |
| 관리 권한 | 모든 카드 설정과 받은 답변 |
| `owner_only` 일반 요청 | 카드만, 답변·집계 미반환 |
| `counts_only` | 수락·거절 집계만 반환 |
| `all_responses` | 공개 조건을 만족한 답변의 공개 DTO만 반환 |

DB 행을 그대로 직렬화하지 않고 목적별 DTO를 사용한다. UI에서 필드를 숨기는 방식은 권한 통제로 인정하지 않는다.

## 6. API 계약 초안

```text
POST   /api/v1/cards
GET    /api/v1/cards/{shareToken}
POST   /api/v1/cards/{shareToken}/responses

POST   /api/v1/management/session
GET    /api/v1/manage/cards/{cardId}
GET    /api/v1/manage/cards/{cardId}/responses
PATCH  /api/v1/manage/cards/{cardId}
DELETE /api/v1/manage/cards/{cardId}/responses/{responseId}
POST   /api/v1/manage/cards/{cardId}:close
POST   /api/v1/manage/cards/{cardId}/share-token:rotate

PATCH  /api/v1/responses/{responseId}
POST   /api/v1/manage/cards/{cardId}:claim
```

### 응답 제출

```js
{
  clientRequestId,
  responseType: "accept",
  nickname: null,
  replyText: null,
  publicConsent: false
}
```

- 생성·제출·링크 재발급에는 idempotency key와 request hash를 적용한다.
- 동일 key와 다른 payload는 `409`로 거부한다.
- PATCH는 `rowVersion` 또는 `If-Match`를 사용하고 충돌은 `409`로 처리한다.

### 오류 envelope

```js
{
  code,
  message,
  fieldErrors: null,
  requestId
}
```

주요 상태: `400`, `401`, `403`, `404`, `409`, `410`, `422`, `429`.

## 7. 프론트엔드 경계

- 기존 App의 전역 `pageProps`에 온라인 서버 상태를 추가하지 않는다.
- 온라인 작성 임시 상태는 `features/online` 전용 draft store에서 관리한다.
- 서버 원본은 API adapter를 통해 로딩한다.
- `ReplyInput`은 직접 모드의 필수 본문 규칙을 유지한다.
- 온라인은 `OnlineResponseForm`을 별도로 만들어 선택 필수·추가 의견 nullable을 구현한다.
- 현재 `HistoryPage`와 온라인 작성자 답변함을 공유하지 않는다.
- mock adapter와 HTTP adapter는 동일 계약을 사용한다.

## 8. 마이그레이션과 롤백

- expand → backfill → contract 순서를 사용한다.
- 기존 localStorage를 자동 삭제하거나 변환하지 않는다.
- 온라인 전환은 사용자가 실행하는 `온라인 카드로 복사`다.
- 서버 성공 전 로컬 원본을 삭제하지 않는다.
- 로컬에서 받은 과거 답변은 공개 동의 부재로 자동 업로드하지 않는다.
- 온라인 기능은 서버 기능 플래그로 신규 생성을 중단할 수 있어야 한다.
- 롤백 시 기존 카드 조회·관리 경로를 가능한 유지한다.
- 파괴적 migration보다 forward-fix를 우선한다.

## 9. D3·D4·D5 경계

### D3 기술 계약

- API·DTO·오류 규격
- 토큰 목적 분리와 digest 저장
- idempotency와 낙관적 동시성
- 권한 projection
- 이미지 upload-intent/finalize 흐름
- migration 호환 규칙

### D4 사용자 승인

- 닉네임과 익명 정책
- 공개 동의와 비동의 답변의 집계 포함
- 답변 수정·마감·중복 기준
- 보관·삭제·복구 기간
- 계정 귀속 후 관리 링크 정책
- 이미지 제한과 개인정보 정책
- 모두의 건넴 운영·신고·제재 정책

### D5 실행 승인

- 서버·DB·스토리지·인증 벤더 선택과 비용
- 클라우드 프로젝트와 운영 비밀키 생성
- 운영 migration
- 도메인·CORS·쿠키 설정
- 실제 배포와 사용자 데이터 수집
- 운영 데이터 삭제

## 10. 알려진 핵심 위험

- 관리 링크 유출에 따른 전체 답변 접근
- 직접 모드와 온라인 nullable 답변 모델 혼용
- 공개 범위 확대 시 기존 비동의 답변 노출
- 네트워크 재시도로 중복 카드·답변 생성
- DB transaction과 객체 저장소 작업의 불일치
- 신고·차단 전에 공개 탐색을 활성화하는 운영 위험
