import { openManagementSession } from "../api/onlineCardsApi.js";

let capturedToken;
let exchangePromise = null;

function readManagementToken() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const tokenFromFragment = params.get("token");
  if (tokenFromFragment) {
    capturedToken = tokenFromFragment;
  } else if (capturedToken === undefined) {
    capturedToken = null;
  }
  return capturedToken;
}

function clearTokenFragment() {
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
}

export function hasManagementToken() {
  return Boolean(readManagementToken());
}

export function ensureManagementSession() {
  const token = readManagementToken();
  if (!token) return Promise.resolve(false);
  if (exchangePromise) return exchangePromise;

  exchangePromise = openManagementSession(token)
    .then(() => {
      clearTokenFragment();
      capturedToken = null;
      return true;
    })
    .catch((error) => {
      exchangePromise = null;
      throw error;
    });

  return exchangePromise;
}
