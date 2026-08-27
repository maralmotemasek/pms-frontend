import api from "./api";


export const registerUser = async (data) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};


export const loginUser = async (data) => {
  const response = await api.post(
    "/auth/login",
    data
  );


  const {
    access_token,
    refresh_token,
    token_type,
  } = response.data;


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


  return response.data;
};


export const getCurrentUser = async () => {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
};


export const logoutUser = () => {
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