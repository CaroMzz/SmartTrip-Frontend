export const TOKEN_KEY = "smarttrip.token";
export const USER_KEY = "smarttrip.user";
export const CURRENT_TRIP_KEY = "smarttrip.currentTripId";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    updateStoredUser(user);
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const updateStoredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("smarttrip:user-updated"));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(CURRENT_TRIP_KEY);
};

export const getCurrentTripId = () => sessionStorage.getItem(CURRENT_TRIP_KEY);

export const setCurrentTripId = (id) => {
  sessionStorage.setItem(CURRENT_TRIP_KEY, id);
};
