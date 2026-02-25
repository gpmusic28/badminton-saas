import axios from "axios";

const API = axios.create({
  baseURL: "https://badminton-saas.onrender.com/api",
  withCredentials: true,
});

export default API;