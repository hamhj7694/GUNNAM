# 건넴 링크 카드 API (P2 최소 구현)

PHP 8.1 이상과 PDO MySQL을 사용하는 비회원 링크 카드 API다. 실제 DB 접속이나 배포는 이 저장소 작업에 포함하지 않는다.

## 서버 설정

1. `config.php.example`을 `config.php`로 복사한다.
2. 닷홈에서 발급한 DB 접속 정보와 정확한 프론트엔드 origin을 입력한다.
3. 닷홈에서는 기본 설정대로 API 내부 `runtime` 하위 폴더를 사용한다. PHP가 폴더를 자동 생성하며 API `.htaccess`가 외부 접근을 차단한다.
4. `config.php`은 Git에 커밋하거나 웹으로 노출하지 않는다.
5. `server/sql/gunnam_minimum_schema.sql`이 적용된 DB를 사용한다.

운영에서는 이 폴더의 내용을 `/gunnam/api/v1/`에 배치한다. `.htaccess`는 REST 경로를 `index.php`로 전달한다. Apache에서 rewrite를 허용하지 않으면 외부 URL 계약은 유지한 채 query-router 설정이 필요하다.

## API

| 메서드 | 경로 | 용도 |
| --- | --- | --- |
| POST | `/api/v1/cards` | 비회원 링크 카드 생성 |
| GET | `/api/v1/cards/{shareToken}` | 공유 카드 조회 |
| POST | `/api/v1/cards/{shareToken}/responses` | 수락·거절 답변 제출 |
| POST | `/api/v1/management/session` | 관리 토큰을 HttpOnly 세션으로 교환 |
| GET | `/api/v1/manage/card` | 관리 세션의 카드 조회 |
| GET | `/api/v1/manage/card/responses` | 관리 세션의 받은 답변 조회 |

관리 토큰은 세션 교환 요청에서만 `Authorization: Bearer`로 받고 이후에는 `HttpOnly; Secure; SameSite=Strict` 쿠키를 사용한다. 세션 교환 요청에는 JSON body가 필요하지 않다. Apache가 Authorization 헤더를 PHP에 직접 전달하지 않는 경우를 위해 `.htaccess` 전달 설정과 `REDIRECT_HTTP_AUTHORIZATION` fallback을 함께 사용한다. 생성 응답의 공유·관리 토큰 원문은 URL에 한 번만 반환되며 DB에는 SHA-256 digest만 저장한다. 토큰, Authorization, Cookie, 성공 응답 body를 로그에 남기지 않는다.

카드와 답변 생성에는 계약 형식의 `Idempotency-Key` 헤더가 필요하다. 원문 키는 저장하지 않으며 HMAC 파생 토큰/digest와 정규화 request hash로 재시도를 판정한다.

## 현재 P2 제한

- 회원가입, 로그인, `public` 카드, 이미지, 답변 수정은 지원하지 않는다.
- 받은 답변은 `(created_at DESC, id DESC)` keyset과 HMAC 서명 cursor로 조회한다.
- 카드 생성은 `REMOTE_ADDR`별 10분당 10회, 답변 생성은 `REMOTE_ADDR`와 카드 조합별 10분당 20회로 제한한다. IP 원문은 파일명·내용에 저장하지 않고 HMAC 식별자만 사용한다. 신뢰할 수 없는 `X-Forwarded-For`는 사용하지 않는다.
- PHP 세션 저장 경로 권한, 세션 파일 정리, Authorization/access log 마스킹은 닷홈 배포 환경에서 검증해야 한다.
- 웹서버 설정상 API 내부 runtime 사용이 허용되지 않는 환경에서는 웹루트 밖의 PHP 쓰기 가능 경로로 변경한다.
- `hmac_secret` 변경은 기존 멱등 재시도에 영향을 주므로 안전하게 백업·버전 관리해야 한다.
- 현재 환경에는 PHP CLI가 없어 `php -l` 검증을 수행하지 못했다.

## P3.1 받은 답변 공개 범위

기존 두 테이블을 그대로 사용하며 별도 DB 변경은 필요하지 않다. 상세 계약은
`docs/10-response-visibility-contract.md`를 따른다.

| 메서드 | 경로 | 용도 |
| --- | --- | --- |
| GET | `/api/v1/cards/{shareToken}/public-results` | 공개 범위에 맞는 집계 또는 동의 답변 조회 |
| PATCH | `/api/v1/manage/card/settings` | 관리 세션으로 받은 답변 공개 범위 변경 |

- 새 링크 카드는 `responseVisibility`를 생략하면 `owner_only`로 생성한다.
- `owner_only` 공개 조회는 답변 존재 여부나 집계를 반환하지 않는다.
- `counts_only`는 삭제되지 않은 모든 수락·거절 답변의 숫자만 반환한다.
- `all_responses`는 `public_consent = 1`인 답변만 조회하며 선택, 닉네임, 추가 의견만 반환한다.
- 답변 제출에는 `visibilityAtSubmission`이 필요하다. 현재 카드 설정과 다르면 저장하지 않고
  `409 VISIBILITY_CHANGED`를 반환한다.
- `all_responses`에서는 boolean `publicConsent`가 필수이고, 다른 범위에서는 `true`를 거부한다.
- 관리 설정 변경은 요청 body에서 카드 ID를 받지 않고 현재 관리 세션의 카드만 변경한다.
- 공개 결과와 관리 설정 응답은 캐시하지 않는다. 운영 서버에서 `PATCH` CORS preflight도 확인한다.
