-- 건넴 온라인 MVP 최소 스키마 v1
-- 테이블: gunnam_account, gunnam_post
-- 호환 목표: MySQL 5.7+/8.x 및 일반적인 MariaDB 호스팅
-- 실제 닷홈 DB 종류와 버전을 확인한 뒤 실행한다.
--
-- 설계 원칙
-- - 직접 건넴 데이터는 DB에 저장하지 않는다.
-- - gunnam_post에서 card/response를 함께 저장한다.
-- - response.parent_id가 원본 card.id를 가리킨다.
-- - payload는 애플리케이션에서 검증한 UTF-8 JSON 문자열이다.
-- - 토큰 원문과 평문 비밀번호는 절대 DB에 저장하지 않는다.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS gunnam_account (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_gunnam_account_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gunnam_post (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    post_type ENUM('card', 'response') NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    account_id BIGINT UNSIGNED NULL,

    -- card와 response의 화면 데이터를 담는 JSON 문자열
    payload LONGTEXT NOT NULL,

    -- card 전용: response 행에서는 NULL
    delivery_mode ENUM('link', 'public') NULL,
    response_visibility ENUM('owner_only', 'counts_only', 'all_responses') NULL,
    share_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    management_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,

    -- response 전용: card 행에서는 NULL
    response_type ENUM('accept', 'reject') NULL,
    public_consent TINYINT(1) NOT NULL DEFAULT 0,
    edit_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,

    status ENUM('open', 'closed', 'deleted') NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_gunnam_post_share_token (share_token_hash),
    UNIQUE KEY uq_gunnam_post_management_token (management_token_hash),
    UNIQUE KEY uq_gunnam_post_edit_token (edit_token_hash),
    KEY ix_gunnam_post_parent (parent_id, post_type, status, created_at),
    KEY ix_gunnam_post_public (delivery_mode, post_type, status, created_at),
    KEY ix_gunnam_post_account (account_id, post_type, created_at),

    CONSTRAINT fk_gunnam_post_parent
        FOREIGN KEY (parent_id)
        REFERENCES gunnam_post (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_gunnam_post_account
        FOREIGN KEY (account_id)
        REFERENCES gunnam_account (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- payload 예시(실제 INSERT 전에 PHP/API에서 구조와 길이를 검증한다)
-- card:
-- {"questionText":"오늘 게임할래?","acceptButtonText":"좋아","rejectButtonText":"싫어","acceptResultText":null,"rejectResultText":null}
-- response:
-- {"nickname":"건넴이","replyText":null,"visibilityAtSubmission":"owner_only"}
--
-- 행별 필수 규칙은 API에서 강제한다.
-- card:
--   parent_id/response_type/edit_token_hash = NULL
--   delivery_mode/response_visibility/share_token_hash = NOT NULL
--   비회원 link 카드는 account_id = NULL, management_token_hash = NOT NULL
--   public 카드는 account_id = NOT NULL
-- response:
--   parent_id/response_type/edit_token_hash = NOT NULL
--   delivery_mode/response_visibility/share_token_hash/management_token_hash = NULL
--   부모가 post_type='card'이며 status='open'일 때만 저장
--
-- 토큰 저장 예시:
-- 애플리케이션에서 생성한 원문 토큰은 사용자에게 한 번만 전달하고,
-- DB에는 LOWER(SHA2(?, 256)) 결과인 64자리 해시만 저장한다.

