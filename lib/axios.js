import axios from "axios"
import { toast } from "react-toastify"


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})
// console.log("API base URL:", process.env.NEXT_PUBLIC_BASE_URL)

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }

    // Don't show toast for user fetch errors during login
    if (!error.config?.url?.includes("/users/self/")) {
      const message = error.response?.data?.message || "An error occurred"
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default api
