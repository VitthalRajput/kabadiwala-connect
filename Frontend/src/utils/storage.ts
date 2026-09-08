const ACCESS_TOKEN_KEY = 'kc_access_token';
const REFRESH_TOKEN_KEY = 'kc_refresh_token';
const DRAFT_LOT_KEY = 'kc_draft_lot';

export const getStoredAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearStoredTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const saveDraftLot = (data: any): void => {
  try {
    localStorage.setItem(DRAFT_LOT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save draft lot', e);
  }
};

export const getDraftLot = (): any | null => {
  try {
    const data = localStorage.getItem(DRAFT_LOT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearDraftLot = (): void => {
  localStorage.removeItem(DRAFT_LOT_KEY);
};

