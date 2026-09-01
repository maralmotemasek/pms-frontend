import api from "./api";


const saveAuthTokens = (
  data
) => {
  const {
    access_token,
    refresh_token,
    token_type,
  } = data;


  if (access_token) {
    localStorage.setItem(
      "access_token",
      access_token
    );
  }


  if (refresh_token) {
    localStorage.setItem(
      "refresh_token",
      refresh_token
    );
  }


  if (token_type) {
    localStorage.setItem(
      "token_type",
      token_type
    );
  }
};


export const clearAuthTokens =
  () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem(
      "token_type"
    );
  };


/* =========================
   REGISTER
========================= */

export const registerUser =
  async (data) => {

    const response =
      await api.post(
        "/auth/register",
        data
      );


    return response.data;
  };


/* =========================
   LOGIN
========================= */

export const loginUser =
  async (data) => {

    const response =
      await api.post(
        "/auth/login",
        data
      );


    saveAuthTokens(
      response.data
    );


    return response.data;
  };


/* =========================
   CURRENT USER
========================= */

export const getCurrentUser =
  async () => {

    const response =
      await api.get(
        "/auth/me"
      );


    return response.data;
  };


/* =========================
   MANUAL REFRESH
========================= */

export const refreshSession =
  async () => {

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );


    if (!refreshToken) {
      throw new Error(
        "Refresh token not found"
      );
    }


    const response =
      await api.post(
        "/auth/refresh",
        null,
        {
          headers: {
            Authorization:
              `Bearer ${refreshToken}`,
          },

          _skipAuthRefresh:
            true,
        }
      );


    saveAuthTokens(
      response.data
    );


    return response.data;
  };


/* =========================
   LOGOUT
========================= */

export const logoutUser =
  async () => {

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );


    try {
      /*
        اگر Refresh Token داریم،
        Logout واقعی Backend
        انجام می‌شود.
      */
      if (refreshToken) {
        await api.post(
          "/auth/logout",
          null,
          {
            headers: {
              Authorization:
                `Bearer ${refreshToken}`,
            },

            _skipAuthRefresh:
              true,
          }
        );
      }
    } finally {
      /*
        حتی اگر Backend در دسترس
        نبود، اطلاعات Session
        محلی پاک می‌شود.
      */
      clearAuthTokens();
    }
  };