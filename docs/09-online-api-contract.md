# P2 비회원 링크 MVP API 계약

- 상태: P2 구현 기준(D3)
- 작성일: 2026-07-15
- 범위: 비회원 링크 카드 생성, 공유 카드 조회, 답변 제출, 관리 권한으로 받은 답변 조회
- 기준 문서: `docs/06-online-expansion-rfc.md`, `docs/07-online-implementation-plan.md`, `docs/08-online-architecture.md`
- 저장 모델: `server/sql/gunnam_minimum_schema.sql`

## 1. 범위와 원칙

이 계약은 이미지, 회원 계정, 모두에게 건넴, 답변 수정, 카드 마감·삭제·링크 재발급을 포함하지 않는다. `direct` 모드는 이 API를 호출하지 않으며 기존 localStorage 흐름을 유지한다.

- API는 UTF-8 JSON만 요청·응답한다.
- DB 행이나 `payload` 원문을 그대로 반환하지 않고 목적별 DTO를 반환한다.
- 공유 토큰은 카드 조회와 답변 제출에만 사용한다.
- 관리 토큰은 받은 답변 전체 조회 권한이며 공유 토큰과 분리한다.
- 토큰 원문은 DB, 애플리케이션 로그, 오류 메시지, 분석 도구에 남기지 않는다.
- 날짜·시간은 UTC ISO 8601 문자열(`2026-07-15T09:30:00Z`)로 반환한다.
- ID는 JavaScript 정밀도 문제를 피하기 위해 JSON 문자열로 반환한다.
- 알 수 없는 요청 필드는 무시하지 않고 `422 UNKNOWN_FIELD`로 거부한다.

## 2. 배포 경로, CORS와 공통 헤더

### 운영 기준 경로

```text
SPA:      https://testham.dothome.co.kr/gunnam/
API base: https://testham.dothome.co.kr/gunnam/api/v1
```

문서의 엔드포인트는 `/api/v1`부터 표기한다. 프론트엔드는 절대 도메인을 코드에 고정하지 않고 Vite 환경값 `VITE_API_BASE_URL`을 사용하며, 운영 기본값은 `/gunnam/api/v1`이다.

PHP 진입점은 `/gunnam/api/v1/index.php`로 둘 수 있고 `.htaccess`가 아래 REST 경로를 해당 진입점으로 전달한다. rewrite를 지원하지 않는 호스팅에서는 동일 계약을 유지하는 query-router 방식으로 내부 라우팅하되, 프론트엔드에 노출되는 URL은 변경하지 않는다.

### CORS

- 운영은 SPA와 API를 같은 origin에 배포하는 것을 기본으로 하며 CORS 헤더를 불필요하게 열지 않는다.
- 개발 환경에서만 설정된 정확한 origin(예: `http://localhost:5173`)을 allowlist로 허용한다.
- `Access-Control-Allow-Origin: *`와 credentials를 함께 사용하지 않는다.
- 개발 cross-origin 관리 요청은 `Access-Control-Allow-Credentials: true`를 사용한다.
- 허용 메서드: `GET, POST, OPTIONS`.
- 허용 요청 헤더: `Content-Type, Idempotency-Key, Authorization, X-Request-ID`.
- 관리 세션 생성과 관리 API는 서버에서 `Origin`을 allowlist와 대조한다.

### 공통 헤더

```http
Accept: application/json
Content-Type: application/json; charset=utf-8
X-Request-ID: <선택, 8~100자 안전한 ASCII>
```

서버는 모든 응답에 `X-Request-ID`를 반환한다. 요청값이 없거나 부적절하면 새 값을 생성한다. 카드·답변 생성 요청에는 다음 헤더가 필수다.

```http
Idempotency-Key: <16~128자, A-Z a-z 0-9 . _ : ->
```

## 3. 공통 응답과 오류

성공 응답은 최상위 `data`를 사용한다.

```json
{
  "data": {}
}
```

오류 응답은 다음 envelope를 사용하며 토큰, SQL, 파일 경로, stack trace를 포함하지 않는다.

```json
{
  "code": "VALIDATION_FAILED",
  "message": "입력값을 확인해주세요.",
  "fieldErrors": {
    "questionText": ["질문을 입력해주세요."]
  },
  "requestId": "req_01J..."
}
```

| HTTP | code | 의미 |
| --- | --- | --- |
| 400 | `INVALID_JSON` | JSON 문법 또는 UTF-8이 올바르지 않음 |
| 400 | `MISSING_IDEMPOTENCY_KEY` | 생성 요청에 멱등성 키가 없음 |
| 401 | `MANAGEMENT_AUTH_REQUIRED` | 관리 세션이 없거나 만료됨 |
| 403 | `MANAGEMENT_ACCESS_DENIED` | 해당 카드의 관리 권한이 없음 |
| 404 | `CARD_NOT_FOUND` | 공유 카드가 없거나 삭제됨; 토큰 존재 여부를 구분하지 않음 |
| 404 | `MANAGED_CARD_NOT_FOUND` | 관리 권한 범위에서 카드가 없음 |
| 409 | `IDEMPOTENCY_CONFLICT` | 같은 멱등성 키를 다른 요청 내용에 재사용함 |
| 409 | `RESPONSE_ALREADY_SUBMITTED` | 동일 제출로 판단된 답변이 이미 저장됨 |
| 410 | `CARD_CLOSED` | 카드가 마감되어 답변할 수 없음 |
| 410 | `MANAGEMENT_TOKEN_INVALID` | 관리 토큰이 유효하지 않거나 폐기됨 |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | JSON 이외의 Content-Type |
| 422 | `VALIDATION_FAILED` | 필드 형식·길이·조합 오류 |
| 422 | `UNKNOWN_FIELD` | 계약에 없는 필드 포함 |
| 429 | `RATE_LIMITED` | 요청 제한 초과; `Retry-After` 포함 |
| 500 | `INTERNAL_ERROR` | 공개 가능한 세부 정보가 없는 서버 오류 |
| 503 | `SERVICE_UNAVAILABLE` | DB 연결 등 일시 장애 |

카드의 존재 여부를 토큰 탐색에 이용하지 못하도록 잘못된 공유 토큰과 삭제된 카드는 모두 같은 `404 CARD_NOT_FOUND` 형태로 반환한다.

## 4. DTO와 입력 정규화

### 공개 카드 DTO

```json
{
  "id": "42",
  "questionText": "오늘 저녁에 게임할래?",
  "acceptButtonText": "좋아요",
  "rejectButtonText": "싫어요",
  "acceptResultText": null,
  "rejectResultText": null,
  "responseVisibility": "owner_only",
  "responseStatus": "open",
  "createdAt": "2026-07-15T09:30:00Z"
}
```

P2는 `deliveryMode = link`, `responseVisibility = owner_only`만 허용한다. 공개 조회 DTO에는 `accountId`, 관리 토큰, 토큰 해시, 답변 수와 다른 답변을 포함하지 않는다.

### 관리 답변 DTO

```json
{
  "id": "57",
  "responseType": "accept",
  "nickname": null,
  "replyText": "좋아! 저녁에 연락할게.",
  "createdAt": "2026-07-15T09:35:00Z"
}
```

### 정규화와 길이

| 필드 | 규칙 |
| --- | --- |
| `questionText` | 문자열, 앞뒤 공백 제거 후 1~500자 |
| `acceptButtonText` | null 또는 문자열, trim 후 빈 값은 `좋아요`, 최대 30자 |
| `rejectButtonText` | null 또는 문자열, trim 후 빈 값은 `싫어요`, 최대 30자 |
| `acceptResultText` | null 또는 문자열, trim 후 빈 값은 null, 최대 500자 |
| `rejectResultText` | null 또는 문자열, trim 후 빈 값은 null, 최대 500자 |
| `responseType` | 필수, `accept` 또는 `reject` |
| `nickname` | 선택, null 또는 문자열, trim 후 빈 값은 null, 최대 50자 |
| `replyText` | 선택, null 또는 문자열, trim 후 빈 값은 null, 최대 1000자 |

길이는 Unicode code point 기준으로 검사하고 제어문자(NUL 등)는 거부한다. 전체 JSON body는 32 KiB 이하로 제한한다. HTML은 저장·출력 시 코드로 실행하지 않고 일반 텍스트로 취급한다.

## 5. 카드 생성

### `POST /api/v1/cards`

비회원 링크 카드를 만들고 공유 토큰과 관리 토큰을 최초 한 번 발급한다.

```http
POST /gunnam/api/v1/cards
Idempotency-Key: 0ad6e4ce-1d3c-4e6b-a431-d62fc59da39d
Content-Type: application/json; charset=utf-8
```

```json
{
  "deliveryMode": "link",
  "responseVisibility": "owner_only",
  "questionText": "오늘 저녁에 게임할래?",
  "acceptButtonText": "좋아!",
  "rejectButtonText": "오늘은 어려워",
  "acceptResultText": "좋아, 이따 만나!",
  "rejectResultText": null
}
```

성공: `201 Created`. 동일 멱등성 키와 동일한 정규화 요청의 재시도는 `200 OK`로 같은 결과를 반환한다.

```json
{
  "data": {
    "card": {
      "id": "42",
      "questionText": "오늘 저녁에 게임할래?",
      "acceptButtonText": "좋아!",
      "rejectButtonText": "오늘은 어려워",
      "acceptResultText": "좋아, 이따 만나!",
      "rejectResultText": null,
      "responseVisibility": "owner_only",
      "responseStatus": "open",
      "createdAt": "2026-07-15T09:30:00Z"
    },
    "shareUrl": "https://testham.dothome.co.kr/gunnam/c/s_7M1...",
    "managementUrl": "https://testham.dothome.co.kr/gunnam/manage#token=m_A9k..."
  }
}
```

- 응답의 토큰은 각각 URL에만 포함하며 별도 필드로 중복 반환하지 않는다.
- 관리 URL은 반드시 fragment(`#token=`)를 사용한다. query string이나 path에 관리 토큰을 넣지 않는다.
- 서버는 `shareUrl`, `managementUrl`이 포함된 성공 body를 access log에 기록하지 않는다.
- 프론트엔드는 생성 완료 전 관리 URL을 router history에 저장하지 않는다. 생성 성공 후 사용자가 요청한 `내가 만든 링크` 기능을 위해 현재 origin의 검증된 관리 URL을 로컬 히스토리에 저장하며, 권한 위험 안내와 개별 삭제를 제공한다.

## 6. 공유 카드 조회

### `GET /api/v1/cards/{shareToken}`

```http
GET /gunnam/api/v1/cards/s_7M1...
```

성공: `200 OK`.

```json
{
  "data": {
    "card": {
      "id": "42",
      "questionText": "오늘 저녁에 게임할래?",
      "acceptButtonText": "좋아!",
      "rejectButtonText": "오늘은 어려워",
      "acceptResultText": "좋아, 이따 만나!",
      "rejectResultText": null,
      "responseVisibility": "owner_only",
      "responseStatus": "open",
      "createdAt": "2026-07-15T09:30:00Z"
    },
    "responseNotice": "작성자만 답변을 확인할 수 있어요. 닉네임과 추가 의견은 다른 사람에게 공개되지 않아요."
  }
}
```

공유 응답에는 `Cache-Control: no-store`와 `Referrer-Policy: no-referrer`를 설정한다. P2에서는 답변 목록과 집계를 절대 포함하지 않는다.

## 7. 답변 제출

### `POST /api/v1/cards/{shareToken}/responses`

`responseType`만 필수다. 닉네임과 추가 의견이 없어도 답변 한 건을 생성한다.

```http
POST /gunnam/api/v1/cards/s_7M1.../responses
Idempotency-Key: f5907df1-1c99-416e-bad6-9a08df0fd974
Content-Type: application/json; charset=utf-8
```

```json
{
  "responseType": "accept",
  "nickname": null,
  "replyText": "좋아! 저녁에 연락할게."
}
```

성공: `201 Created`. 같은 멱등성 키와 같은 정규화 요청의 재시도는 `200 OK`로 기존 결과를 반환한다.

```json
{
  "data": {
    "response": {
      "id": "57",
      "responseType": "accept",
      "nickname": null,
      "replyText": "좋아! 저녁에 연락할게.",
      "createdAt": "2026-07-15T09:35:00Z"
    },
    "result": {
      "text": "좋아, 이따 만나!"
    }
  }
}
```

- `responseType`이 없고 `replyText`만 있으면 `422 VALIDATION_FAILED`이며 DB 기록을 만들지 않는다.
- 빈 `replyText`와 빈 `nickname`은 null로 저장하고 빈 UI 영역을 만들지 않는다.
- P2의 `publicConsent`는 항상 false, `visibilityAtSubmission`은 항상 `owner_only`로 서버가 기록한다. 클라이언트 입력으로 받지 않는다.
- edit token은 P2 사용자에게 발급하지 않는다. `edit_token_hash` 컬럼은 P2에서 답변 생성 멱등성 digest를 저장하는 내부 용도로만 사용하며 API DTO에 노출하지 않는다. 실제 답변 수정 기능을 도입할 때는 별도 migration으로 목적을 분리한다.

## 8. 관리 토큰 교환과 관리 세션

### 최초 관리 화면 처리

1. 브라우저가 `/gunnam/manage#token=m_A9k...`를 연다. fragment는 HTTP 요청에 포함되지 않는다.
2. SPA가 fragment의 토큰을 메모리로 읽는다.
3. SPA가 아래 세션 교환 API를 호출한다. StrictMode의 중복 실행은 같은 교환 작업을 공유한다.
4. 교환 성공 후에만 `history.replaceState`로 주소에서 fragment를 제거한다.
5. 교환 실패 시 현재 페이지 메모리의 토큰을 유지해 재시도할 수 있게 한다.

### `POST /api/v1/management/session`

```http
POST /gunnam/api/v1/management/session
Authorization: Bearer m_A9k...
```

이 요청에는 body가 필요하지 않으며 서버는 body를 읽거나 저장하지 않는다.

성공: `204 No Content`이며 다음 쿠키를 설정한다.

```http
Set-Cookie: gunnam_manage_session=<opaque>; Path=/gunnam/api/v1/manage; HttpOnly; Secure; SameSite=Strict; Max-Age=43200
Cache-Control: no-store
```

- 관리 토큰은 body, query string, path, cookie에 직접 넣지 않는다.
- Authorization 헤더는 웹서버와 PHP access log에서 마스킹하거나 기록하지 않는다.
- 세션은 한 카드의 관리 권한만 가지며 최대 12시간 유효하다.
- 세션 저장값은 원문 관리 토큰이 아니라 임의 세션 ID와 카드 ID의 서버 측 매핑이다.
- 잘못된 토큰은 `410 MANAGEMENT_TOKEN_INVALID`로 반환하고 토큰 존재 여부의 추가 정보를 주지 않는다.

## 9. 관리 카드와 받은 답변 조회

### `GET /api/v1/manage/card`

현재 관리 세션에 연결된 카드 하나를 조회한다. 카드 ID를 URL에서 받지 않아 다른 카드 ID 열거 공격을 줄인다.

```http
GET /gunnam/api/v1/manage/card
Cookie: gunnam_manage_session=<opaque>
```

성공: `200 OK`.

```json
{
  "data": {
    "card": {
      "id": "42",
      "questionText": "오늘 저녁에 게임할래?",
      "acceptButtonText": "좋아!",
      "rejectButtonText": "오늘은 어려워",
      "acceptResultText": "좋아, 이따 만나!",
      "rejectResultText": null,
      "responseVisibility": "owner_only",
      "responseStatus": "open",
      "createdAt": "2026-07-15T09:30:00Z"
    }
  }
}
```

### `GET /api/v1/manage/card/responses`

현재 관리 세션 카드의 받은 답변을 최신순으로 조회한다.

쿼리 매개변수:

- `limit`: 선택, 기본 20, 최소 1, 최대 50
- `cursor`: 선택, 직전 응답의 불투명 cursor

```http
GET /gunnam/api/v1/manage/card/responses?limit=20&cursor=eyJ...
Cookie: gunnam_manage_session=<opaque>
```

성공: `200 OK`.

```json
{
  "data": {
    "items": [
      {
        "id": "57",
        "responseType": "accept",
        "nickname": null,
        "replyText": "좋아! 저녁에 연락할게.",
        "createdAt": "2026-07-15T09:35:00Z"
      },
      {
        "id": "56",
        "responseType": "reject",
        "nickname": "민지",
        "replyText": null,
        "createdAt": "2026-07-15T09:34:00Z"
      }
    ],
    "nextCursor": null
  }
}
```

- 정렬은 `(created_at DESC, id DESC)`로 고정하고 cursor도 두 값을 서명해 담는다.
- 빈 목록은 `items: []`, `nextCursor: null`로 반환한다.
- 관리 응답에는 `Cache-Control: private, no-store`를 설정한다.
- 쿠키가 없거나 만료되면 `401`, 다른 카드의 권한이면 `403`이다. DB ID나 공유 토큰만으로는 이 API에 접근할 수 없다.

## 10. 멱등성과 토큰 생성 구현 계약

현재 최소 스키마에는 별도 멱등성 테이블이 없다. P2에서는 서버 비밀키와 요청의 `Idempotency-Key`를 이용한 목적별 HMAC-SHA-256 파생값으로 재시도를 식별한다.

- 카드 생성: `card-share`, `card-management` 네임스페이스로 서로 다른 토큰을 파생한다.
- 답변 생성: 카드 ID를 포함한 `response-edit` 네임스페이스의 digest를 `edit_token_hash`에 내부 멱등성 표식으로 저장하되 P2 사용자에게 edit token을 발급하지 않는다.
- 저장된 `payload`에는 원문 키가 아니라 `SHA-256(Idempotency-Key)`와 정규화 request hash만 내부 메타데이터로 저장한다.
- 같은 key·같은 request hash는 기존 행을 반환한다.
- 같은 key·다른 request hash는 `409 IDEMPOTENCY_CONFLICT`다.
- 토큰은 URL-safe base64url이며 접두사 `s_`(share), `m_`(management)를 사용하고 최소 128-bit 이상의 예측 불가능성을 가진다.
- DB에는 각 토큰의 SHA-256 hex digest만 저장한다.
- 서버 HMAC 비밀키가 바뀌면 재시도 결과 재생성이 불가능하므로 배포 환경의 비밀 저장소에서 버전과 백업을 관리한다.

트랜잭션 안에서 부모 카드의 `post_type = card`, `status = open`을 잠금 확인한 뒤 답변을 삽입한다. unique 충돌은 성공 재시도인지 payload 충돌인지 다시 조회해 판정한다.

## 11. 보안·로그·브라우저 규칙

- `share_token_hash`, `management_token_hash`, `edit_token_hash`, DB payload 내부 메타데이터는 API DTO에 포함하지 않는다.
- 요청 URL을 기록해야 한다면 share token path segment를 `[REDACTED]`로 치환한다.
- Authorization, Cookie, Set-Cookie와 성공 body를 로그에 남기지 않는다.
- 관리 화면에는 `Referrer-Policy: no-referrer`, `Cache-Control: no-store`를 적용한다.
- SPA는 관리 화면 bootstrap 전에 분석 SDK를 실행하거나 외부 리소스를 로드하지 않는다.
- SQL은 PDO prepared statement를 사용하고 emulated prepares를 끈다.
- 비정상 토큰 반복, 카드 생성과 답변 제출은 IP와 카드 단위로 제한하되 IP 원문을 장기 보관하지 않는다.
- 클라이언트 검증과 별개로 서버가 모든 입력·권한·상태를 다시 검증한다.

## 12. 프론트엔드 인계

- HTTP adapter의 메서드는 `createLinkCard`, `getSharedCard`, `submitResponse`, `openManagementSession`, `getManagedCard`, `listManagedResponses`로 분리한다.
- online draft는 기존 `cardData`와 localStorage 히스토리에 합치지 않는다.
- 생성 완료 화면은 공유 URL과 관리 URL을 구분하고 관리 URL의 권한 위험을 안내한다.
- 관리 URL fragment는 세션 교환 성공 후 주소에서 제거한다. 작성 브라우저의 링크 히스토리에 저장된 관리 URL 외에는 localStorage·sessionStorage에 복제하지 않는다.
- `responseType` 선택 전에는 제출을 막고, nickname과 replyText는 선택 입력으로 표시한다.
- `404`, `409`, `410`, `422`, `429`를 각각 사용자 행동 가능한 상태로 표현한다.

## 13. 백엔드 인계

- PHP router, JSON parser, validator, 오류 envelope, request ID middleware를 공통 계층으로 둔다.
- 카드/답변 payload에 저장되는 공개 데이터와 내부 멱등성 메타데이터를 분리해 직렬화한다.
- 토큰 비교는 digest에 대해 timing-safe 비교를 사용한다.
- 관리 세션에는 카드 ID만 저장한다. 닷홈에서는 API 내부 `runtime`을 사용하되 `.htaccess`로 외부 접근을 차단하고, 웹루트 밖 쓰기 경로가 제공되는 환경에서는 해당 경로를 우선한다.
- 응답 저장과 멱등성 판정은 DB transaction으로 처리한다.
- 운영 환경에서 토큰·쿠키·응답 body가 웹서버/PHP 오류 로그에 남지 않는지 배포 전 확인한다.

## 14. 계약 테스트 지점

1. 선택만 제출해도 답변이 1건 생성된다.
2. 공백 nickname/replyText는 null로 반환된다.
3. 선택 없이 추가 의견만 보내면 `422`이며 행이 생기지 않는다.
4. 같은 멱등성 키·같은 body 재시도는 같은 ID를 반환한다.
5. 같은 멱등성 키·다른 body는 `409`다.
6. 공유 조회 응답에는 답변, 집계, 관리 정보가 없다.
7. 공유 토큰으로 관리 API를 호출하면 `401` 또는 `403`이다.
8. 관리 토큰은 fragment에서 제거되고 URL·DB·로그·Referer에 원문이 없다.
9. 관리 세션 A로 카드 B의 답변을 읽을 수 없다.
10. 마감 상태에서 답변 제출은 `410`이며 행이 생기지 않는다.
11. 1000자를 넘는 replyText와 32 KiB 초과 body는 거부된다.
12. 악성 HTML 문자열은 실행되지 않고 일반 텍스트로 표시된다.

## 15. P2 이후로 미룬 결정

- 닉네임 필수화 또는 익명 표시 문구
- 동일 사용자의 복수 답변 허용 기준
- 답변 수정용 edit token 발급
- 공개 범위 변경과 공개 동의
- 카드 마감·삭제·링크 재발급
- 계정 귀속과 관리 링크 유지 정책

이 항목들은 P2 계약을 임의로 확장하지 않으며 P3 이상에서 D4 승인 후 추가한다.
