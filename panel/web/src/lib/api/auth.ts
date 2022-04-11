import axios from "axios";

import { getApiBaseUrl } from "../firebase/functions";
const apiBaseUrl = getApiBaseUrl();

export async function getAuthToken(code: string): Promise<string> {
  return axios
    .get(`${apiBaseUrl}/token`, {
      params: {
        code: code,
      },
    })
    .then((res) => {
      return res.data.token;
    })
    .catch((error) => {
      throw new Error(error);
    });
}
