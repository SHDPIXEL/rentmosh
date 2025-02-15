import React from "react";
import axios from "axios";

// Base URL for the API
export const BASE_URL = "http://192.168.91.244:4030"; // Replace with your server's base URL
// export const BASE_URL = "http://192.168.17.244:4030"; // Replace with your server's base URL

// Create an Axios instance
const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default content type
    },
});

// Add a request interceptor (optional, for auth or logging)
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor (optional, for global error handling)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Response Error:", error.response || error.message);
        return Promise.reject(error.response?.data || error.message);
    }
);

const ApiComponent = () => {
    return <></>;
};

export default API;
