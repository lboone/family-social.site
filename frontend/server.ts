export const BASE_API_URL =
  process.env.NEXT_PUBLIC_ENV === "development"
    ? process.env.NEXT_PUBLIC_BACKEND_API_DEV
    : process.env.NEXT_PUBLIC_BACKEND_API_PROD;
export const API_URL = `${BASE_API_URL}${process.env.NEXT_PUBLIC_BACKEND_API_VERSION}`;
export const API_URL_USER = `${API_URL}/users`;
export const API_URL_POST = `${API_URL}/posts`;
