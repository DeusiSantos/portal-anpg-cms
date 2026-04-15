import axios from "axios";

const api = axios.create({
  baseURL: "https://mwangobrainsa-001-site6.mtempurl.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;