import axios from "axios";


const API_BASE_URL = "/api";


const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});


const refreshClient = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});


const clearStoredTokens = () => {
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


const saveTokens = (data) => {
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


let refreshPromise = null;


/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem(
        "access_token"
      );


    if (
      accessToken &&
      !config.headers.Authorization
    ) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }


    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/* =========================
   REFRESH TOKEN
========================= */

const requestNewTokens =
  async () => {

    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );


    if (!refreshToken) {
      throw new Error(
        "Refresh token is missing"
      );
    }


    const response =
      await refreshClient.post(
        "/auth/refresh",
        null,
        {
          headers: {
            Authorization:
              `Bearer ${refreshToken}`,
          },
        }
      );


    if (
      !response.data?.access_token ||
      !response.data?.refresh_token
    ) {
      throw new Error(
        "Invalid refresh response"
      );
    }


    saveTokens(response.data);


    return response.data.access_token;
  };


/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;


    const status =
      error.response?.status;


    if (
      status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(
        error
      );
    }


    if (
      originalRequest
        ._skipAuthRefresh
    ) {
      return Promise.reject(
        error
      );
    }


    if (
      originalRequest._retry
    ) {
      return Promise.reject(
        error
      );
    }


    const requestUrl =
      originalRequest.url || "";


    if (
      requestUrl.includes(
        "/auth/login"
      ) ||
      requestUrl.includes(
        "/auth/register"
      ) ||
      requestUrl.includes(
        "/auth/refresh"
      )
    ) {
      return Promise.reject(
        error
      );
    }


    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );


    if (!refreshToken) {
      clearStoredTokens();

      return Promise.reject(
        error
      );
    }


    originalRequest._retry =
      true;


    try {
      if (!refreshPromise) {
        refreshPromise =
          requestNewTokens()
            .finally(() => {
              refreshPromise =
                null;
            });
      }


      const newAccessToken =
        await refreshPromise;


      originalRequest.headers =
        originalRequest.headers ||
        {};


      originalRequest
        .headers
        .Authorization =
        `Bearer ${newAccessToken}`;


      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      clearStoredTokens();


      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.href =
          "/login";
      }


      return Promise.reject(
        refreshError
      );
    }
  }
);


export default api;