const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/gunnam/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, code = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: { Accept: "application/json", "Content-Type": "application/json; charset=utf-8", ...options.headers }
    });
  } catch {
    throw new ApiError("서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      body?.error?.message || body?.message || "요청을 처리하지 못했어요.",
      response.status,
      body?.error?.code || body?.code || ""
    );
  }
  return body?.data ?? body;
}

export function createLinkCard(card, idempotencyKey) {
  return request("/cards", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(card) });
}

export function getSharedCard(shareToken) {
  return request(`/cards/${encodeURIComponent(shareToken)}`).then((data) => data.card ? data : { card: data });
}

export function submitResponse(shareToken, response, idempotencyKey) {
  return request(`/cards/${encodeURIComponent(shareToken)}/responses`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(response)
  });
}

export function listPublicResponses(shareToken, cursor) {
  const query = cursor ? `?limit=20&cursor=${encodeURIComponent(cursor)}` : "?limit=20";
  return request(`/cards/${encodeURIComponent(shareToken)}/public-results${query}`);
}

export function openManagementSession(managementToken) {
  return request("/management/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${managementToken}` }
  });
}

export function getManagedCard() {
  return request("/manage/card");
}

export function listManagedResponses(cursor) {
  const query = cursor ? `?limit=20&cursor=${encodeURIComponent(cursor)}` : "?limit=20";
  return request(`/manage/card/responses${query}`);
}


export function updateManagedResponseVisibility(responseVisibility) {
  return request("/manage/card/settings", {
    method: "PATCH",
    body: JSON.stringify({ responseVisibility })
  });
}
