import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:3001/api";

console.log("API BASE URL:", baseURL);

const API = axios.create({
  baseURL,
  withCredentials: true
});

export default API;