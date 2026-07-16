# P3.1 받은 답변 공개 범위 계약

- 상태: 구현 기준안(Approved for P3.1 implementation)
- 작성일: 2026-07-16
- 적용 대상: `link` 카드
- 선행 계약: `docs/09-online-api-contract.md`
- 데이터베이스 변경: 없음. 기존 `gunnam_post.response_visibility`, `gunnam_post.public_consent`, `payload.visibilityAtSubmission`을 사용한다.

## 1. 목표와 범위

작성자가 카드 생성 시 받은 답변 공개 범위를 선택하고 관리 화면에서 언제든 변경할 수 있게 한다. 응답자는 제출 전에 현재 공개 방식과 자신의 공개 동의 효과를 알 수 있어야 하며, 서버는 화면을 신뢰하지 않고 매 요청에서 공개 범위를 다시 판정한다.

이번 단계에 포함한다.

- 카드 생성 시 `owner_only | counts_only | all_responses` 선택
- 공유 카드 조회 시 현재 설정에 맞는 안내와 동의 요구 반환
- 답변 제출 시 공개 동의 저장
- 공유 링크 권한으로 익명 집계 또는 공개 동의 답변 조회
- 관리 세션 권한으로 공개 범위 변경

계정, 공개 카드 목록, 답변 수정, 신고·차단, 카드 삭제·마감은 이번 계약의 범위가 아니다.

## 2. 제품 정책

### 2.1 공개 범위

| 값 | 사용자 문구 | 공개되는 정보 |
| --- | --- | --- |
| `owner_only` | 작성자만 보기 | 작성자 관리 화면 외에는 어떤 답변 정보도 공개하지 않는다. |
| `counts_only` | 결과 숫자만 공개 | 모든 유효 답변의 수락·거절·전체 숫자만 익명으로 공개한다. |
| `all_responses` | 전체 답변 공개 | 제출 당시 `publicConsent = true`인 답변의 선택, 닉네임, 추가 의견만 공개한다. |

새 링크 카드의 기본값은 `owner_only`다. 프론트엔드가 값을 생략해도 서버가 `owner_only`로 정규화한다. 알 수 없는 값은 `422 VALIDATION_FAILED`로 거부한다.

### 2.2 유효 답변

이 문서에서 유효 답변은 다음 조건을 모두 만족하는 행이다.

- `post_type = 'response'`
- 요청한 카드가 부모다.
- `status <> 'deleted'`
- `response_type`이 `accept` 또는 `reject`다.

`counts_only` 집계에는 공개 동의 여부, 닉네임 또는 추가 의견 유무와 관계없이 모든 유효 답변을 포함한다. 카드 행이나 삭제된 답변은 포함하지 않는다.

### 2.3 공개 동의

- `owner_only`, `counts_only` 제출에는 공개 동의 UI를 표시하지 않는다. 서버는 `publicConsent` 생략 또는 `false`만 허용하고 DB에는 `0`을 기록한다.
- `all_responses` 제출에는 체크되지 않은 명시적 동의 항목을 표시한다. `publicConsent`는 boolean으로 반드시 전송하며, `false`여도 답변 제출은 가능하다.
- 동의 대상은 `responseType`, `nickname`, `replyText`다. 닉네임과 추가 의견이 비어 있어도 선택 결과 공개에는 동의가 필요하다.
- 기존 답변과 `owner_only` 또는 `counts_only`에서 받은 답변은 동의하지 않은 것으로 유지한다. 작성자가 나중에 `all_responses`로 변경해도 원문은 공개하지 않는다.
- 공개 범위를 비공개 방향으로 변경하면 즉시 공개를 중단한다. 다시 `all_responses`로 바꾸면 과거에 명시적으로 동의한 답변만 다시 공개할 수 있다.
- 작성자는 응답자의 `publicConsent` 값을 대신 변경할 수 없다.

응답 저장 시 카드의 현재 공개 범위를 `payload.visibilityAtSubmission`에 함께 기록한다. 이 값은 감사·안내 근거이며 실제 공개 여부는 조회 시점의 카드 `response_visibility`와 답변 `public_consent`를 함께 판정한다.

## 3. 응답자 안내 문구

공유 카드 조회 응답의 `responseNotice`를 그대로 UI에 표시한다.

| 공개 범위 | 제출 전 안내 |
| --- | --- |
| `owner_only` | `작성자만 답변을 확인할 수 있어요. 선택, 닉네임과 추가 의견은 다른 사람에게 공개되지 않아요.` |
| `counts_only` | `수락·거절 결과 숫자는 공유 링크를 아는 사람에게 공개돼요. 닉네임과 추가 의견은 작성자만 확인할 수 있어요.` |
| `all_responses` | `공개에 동의하면 선택, 닉네임과 추가 의견이 공유 링크를 아는 사람에게 공개돼요. 동의하지 않아도 답변할 수 있어요.` |

`all_responses` 동의 항목 문구:

> 내 선택, 닉네임과 추가 의견을 이 카드의 공개 답변에 표시하는 것에 동의해요.

동의 항목은 기본적으로 체크하지 않는다. 공개 범위가 응답 화면을 연 뒤 바뀔 수 있으므로 제출 API가 현재 정책을 다시 검증한다. 정책 불일치 시 아래 `VISIBILITY_CHANGED` 오류로 최신 카드를 다시 불러오게 한다.

## 4. DTO

### 4.1 공유 카드 DTO 확장

`GET /api/v1/cards/{shareToken}`의 `card`에 현재 `responseVisibility`를 포함하고 다음 메타데이터를 반환한다.

```json
{
  "data": {
    "card": {
      "id": "42",
      "questionText": "오늘 저녁에 게임할래?",
      "acceptButtonText": "좋아요",
      "rejectButtonText": "싫어요",
      "acceptResultText": null,
      "rejectResultText": null,
      "responseVisibility": "all_responses",
      "responseStatus": "open",
      "createdAt": "2026-07-16T03:00:00Z"
    },
    "responseNotice": "공개에 동의하면 선택, 닉네임과 추가 의견이 공유 링크를 아는 사람에게 공개돼요. 동의하지 않아도 답변할 수 있어요.",
    "publicResults": {
      "available": true,
      "kind": "responses"
    },
    "consent": {
      "required": true,
      "defaultValue": false
    }
  }
}
```

`publicResults.kind`는 `private | counts | responses`다. `owner_only`에서는 `available = false`, 나머지는 `true`다. 이 응답 자체에는 집계나 다른 사람의 답변을 넣지 않는다.

### 4.2 공개 답변 DTO

공개 응답 항목은 아래 세 필드만 갖는다.

```json
{
  "responseType": "accept",
  "nickname": "건넴이",
  "replyText": "좋아요!"
}
```

빈 닉네임과 추가 의견은 `null`이다. 답변 ID, 계정 ID, 작성 시각, `publicConsent`, `visibilityAtSubmission`, payload, 토큰·해시를 반환하지 않는다.

### 4.3 관리 DTO

관리 카드 DTO는 현재 `responseVisibility`를 반환한다. 관리 답변 DTO는 작성자에게 원문 전체를 보여주되 공개 상태 확인을 위해 `publicConsent`와 `visibilityAtSubmission`을 추가할 수 있다.

```json
{
  "id": "57",
  "responseType": "accept",
  "nickname": "건넴이",
  "replyText": "좋아요!",
  "publicConsent": true,
  "visibilityAtSubmission": "all_responses",
  "createdAt": "2026-07-16T03:05:00Z"
}
```

## 5. API 계약

기존 공통 헤더, 오류 envelope, 토큰 보호, 요청 크기 제한은 `docs/09-online-api-contract.md`를 따른다.

### 5.1 카드 생성

`POST /api/v1/cards`

```json
{
  "deliveryMode": "link",
  "responseVisibility": "counts_only",
  "questionText": "오늘 저녁에 게임할래?",
  "acceptButtonText": "좋아요",
  "rejectButtonText": "싫어요",
  "acceptResultText": null,
  "rejectResultText": null
}
```

`responseVisibility`는 생략 가능하며 기본값은 `owner_only`다. 멱등성 request hash에는 정규화된 공개 범위를 포함한다. 같은 멱등성 키로 공개 범위만 다르게 보내면 `409 IDEMPOTENCY_CONFLICT`다.

### 5.2 답변 제출

`POST /api/v1/cards/{shareToken}/responses`

```json
{
  "responseType": "accept",
  "nickname": "건넴이",
  "replyText": "좋아요!",
  "publicConsent": true,
  "visibilityAtSubmission": "all_responses"
}
```

- `visibilityAtSubmission`은 프론트가 마지막으로 본 카드 공개 범위이며 세 값 중 하나여야 한다.
- 서버의 현재 공개 범위와 다르면 `409 VISIBILITY_CHANGED`를 반환하고 저장하지 않는다.
- 현재 범위가 `all_responses`이면 `publicConsent` boolean이 필수다.
- 현재 범위가 나머지 두 값이면 `publicConsent`는 생략 또는 `false`만 허용한다.
- 정규화된 `publicConsent`와 `visibilityAtSubmission`을 멱등성 request hash에 포함한다.
- 성공 응답의 본인 답변 DTO에는 `publicConsent`를 포함할 수 있지만 다른 사람의 답변은 포함하지 않는다.

### 5.3 공개 결과 조회

`GET /api/v1/cards/{shareToken}/public-results?limit=20&cursor=...`

공유 토큰 외 인증은 필요하지 않다. 카드가 삭제됐거나 토큰이 틀리면 기존과 동일하게 `404 CARD_NOT_FOUND`, 카드가 마감됐더라도 기존 결과 열람은 가능하다.

`owner_only` 성공 응답:

```json
{
  "data": {
    "kind": "private"
  }
}
```

집계나 빈 배열을 함께 보내지 않아 답변 존재 여부를 추론할 단서를 줄인다.

`counts_only` 성공 응답:

```json
{
  "data": {
    "kind": "counts",
    "counts": {
      "total": 12,
      "accept": 8,
      "reject": 4
    }
  }
}
```

`all_responses` 성공 응답:

```json
{
  "data": {
    "kind": "responses",
    "items": [
      {
        "responseType": "accept",
        "nickname": "건넴이",
        "replyText": "좋아요!"
      }
    ],
    "nextCursor": null
  }
}
```

- 공개 목록은 `public_consent = 1 AND status <> 'deleted'`만 조회한다.
- 정렬은 `(created_at DESC, id DESC)`이며 서명된 opaque cursor를 사용한다.
- `limit` 기본 20, 최소 1, 최대 50이다.
- `counts_only`에서는 `cursor`를 허용하지 않는다. 전달하면 `422 UNKNOWN_FIELD`다.
- 공개 범위가 요청 도중 바뀌면 각 쿼리는 DB에서 읽은 현재 범위의 projection 하나만 반환한다.
- 응답은 `Cache-Control: no-store`, `Referrer-Policy: no-referrer`를 사용한다.

### 5.4 관리 설정 변경

`PATCH /api/v1/manage/card/settings`

관리 세션 쿠키가 필수다.

```json
{
  "responseVisibility": "all_responses"
}
```

성공: `200 OK`

```json
{
  "data": {
    "card": {
      "id": "42",
      "responseVisibility": "all_responses",
      "updatedAt": "2026-07-16T03:10:00Z"
    }
  }
}
```

- 허용 필드는 `responseVisibility` 하나뿐이다.
- 변경은 카드 행 하나를 트랜잭션에서 갱신하고 즉시 적용한다.
- 변경 시 기존 답변의 `public_consent`나 payload를 일괄 수정하지 않는다.
- 동일 값으로 변경하는 요청은 성공하는 멱등 동작이다.
- 여러 탭에서 변경하면 마지막으로 성공한 요청이 적용된다.
- `PATCH`와 `Content-Type`을 CORS allowlist에 추가한다.

## 6. 오류

기존 오류에 다음을 추가한다.

| HTTP | code | 의미와 프론트엔드 처리 |
| --- | --- | --- |
| 409 | `VISIBILITY_CHANGED` | 응답 화면을 연 뒤 설정이 바뀜. 입력은 유지하고 공유 카드를 다시 조회해 안내·동의 UI를 갱신한다. |
| 422 | `PUBLIC_CONSENT_REQUIRED` | `all_responses`인데 boolean 동의 값이 없음. 동의 또는 비동의를 명시하게 한다. |
| 422 | `PUBLIC_CONSENT_NOT_ALLOWED` | 비공개/숫자 공개인데 `true`를 전송함. 최신 카드 정책을 다시 조회한다. |
| 422 | `VALIDATION_FAILED` | 공개 범위가 enum 밖이거나 필드 타입이 잘못됨. |
| 422 | `UNKNOWN_FIELD` | 계약에 없는 필드 또는 집계 조회에 cursor 전달. |

관리 설정 API의 세션 오류는 기존 `401 MANAGEMENT_AUTH_REQUIRED`, 권한 오류는 `403 MANAGEMENT_ACCESS_DENIED`를 사용한다. 오류 응답에 현재 공개 범위나 답변 수를 넣어 권한 없는 정보가 새지 않게 한다.

## 7. 서버 권한과 보안 규칙

- 공개 projection은 반드시 서버 SQL 조건과 DTO allowlist로 만든다. 관리 DTO를 필터링해 재사용하지 않는다.
- `owner_only`에서 집계 쿼리나 답변 목록 쿼리를 실행하지 않는다.
- `counts_only`에서 `nickname`, `replyText`, 개별 ID·시간을 선택하거나 반환하지 않는다.
- `all_responses`에서 `public_consent = 1` 조건이 없는 쿼리는 품질 게이트 실패다.
- 카드의 현재 공개 범위는 클라이언트 값이 아니라 DB 값을 기준으로 판정한다.
- 관리 세션의 카드 ID만 변경할 수 있으며 요청 body로 카드 ID를 받지 않는다.
- 공유·관리 토큰과 쿠키, payload 원문은 로그에 기록하지 않는다.
- 사용자 문자열은 HTML이 아닌 일반 텍스트로 반환한다.
- 공개 결과는 CDN·공유 캐시에 저장하지 않는다. 설정 변경 직후 이전 결과가 남지 않아야 한다.
- 공개 범위 변경 자체에는 응답자 원문 복사나 데이터 마이그레이션이 없다.

## 8. 프론트엔드 상태와 화면 규칙

### 카드 생성

- 세 옵션을 라디오 그룹으로 제공하고 기본 선택은 `작성자만 보기`다.
- 각 옵션 아래에 실제 공개 정보를 한 문장으로 설명한다.
- 선택값을 카드 생성 API에 보낸다.

### 공유 카드와 답변 제출

- 서버의 `responseNotice`를 선택·제출 영역 가까이에 표시한다.
- `counts_only`, `all_responses`에서 공개 결과 확인 버튼을 제공한다.
- `all_responses`에서만 비필수 공개 동의 체크박스를 제공한다.
- 설정 변경 오류가 나도 선택, 닉네임, 추가 의견을 지우지 않는다.
- 체크박스는 라벨과 키보드 focus가 있어야 하며, 동의하지 않아도 제출 버튼을 사용할 수 있다.

### 작성자 관리 화면

- 현재 공개 범위를 표시하고 세 옵션으로 변경할 수 있게 한다.
- 변경 전에 각 옵션의 영향을 안내한다.
- `all_responses`로 바꿀 때 `동의한 답변만 공개되며 기존 비동의 답변은 공개되지 않아요.`를 표시한다.
- 저장 중 중복 클릭을 막고 성공·실패 상태를 접근 가능한 status/alert로 알린다.

## 9. 인수 조건

1. 새 카드가 공개 범위 생략 시 `owner_only`로 생성된다.
2. 카드 생성 시 세 범위 모두 저장되고 공유 조회에 동일하게 반환된다.
3. `owner_only` 공개 결과에는 답변 수, 닉네임, 추가 의견, 개별 선택이 전혀 없다.
4. `counts_only` 숫자는 동의하지 않았거나 본문이 없는 답변도 포함하며 삭제 답변은 제외한다.
5. `counts_only` 응답에는 닉네임, 추가 의견, 답변 ID·시간이 없다.
6. `all_responses`에는 명시적으로 동의한 답변만 나오고 반환 항목은 선택·닉네임·추가 의견뿐이다.
7. 기존 `public_consent = 0` 답변은 설정을 `all_responses`로 바꿔도 공개되지 않는다.
8. `all_responses` 응답자는 동의하지 않고도 답변을 제출할 수 있고 그 답변은 작성자만 원문을 볼 수 있다.
9. 화면을 연 뒤 공개 범위가 바뀌면 오래된 동의 조건으로 저장되지 않고 `VISIBILITY_CHANGED`가 발생한다.
10. 작성자는 유효한 관리 세션으로 세 범위를 언제든 변경할 수 있고 공유 결과에 즉시 반영된다.
11. 공유 토큰으로 관리 설정을 바꾸거나 관리 원문 답변을 조회할 수 없다.
12. 공개 범위를 왕복 변경해도 답변 원문과 명시적 동의 값이 변조되지 않는다.
13. 공개 결과의 빈 목록과 마지막 페이지는 `items: []`, `nextCursor: null`로 안정적으로 반환된다.
14. 직접 건넴 localStorage 흐름과 기존 작성자 답변함은 회귀하지 않는다.
15. 모바일 320px, 키보드, 스크린리더에서 공개 범위 선택·동의·설정 변경이 가능하다.

## 10. 구현 순서와 품질 게이트

1. 백엔드 검증·DTO·공개 projection을 구현하고 권한 단위 테스트를 먼저 만든다.
2. 프론트엔드 카드 생성 선택과 응답자 안내·동의를 연결한다.
3. 관리 설정 변경 UI를 연결한다.
4. 공개 결과 화면을 연결한다.
5. 실제 닷홈 DB에서 공개 범위별 생성→응답→변경→조회 시나리오를 검증한다.

다음 중 하나라도 발생하면 배포를 차단한다.

- `owner_only` 또는 `counts_only`에서 원문·닉네임이 노출됨
- 동의하지 않은 답변이 `all_responses`에 노출됨
- 안내 문구와 서버 반환 정책이 다름
- 설정 변경 후 캐시 때문에 이전 공개 데이터가 남음
- 관리 세션 없이 설정을 변경할 수 있음

