import api from "./axios"

export const authService = {
  async login(username, password) {
    const response = await api.post("/users/login/", { username, password })
    if (response.data.success) {

      const { access } = response.data.data // Token is at response.data.data.access
      // console.log("Login successful, token:", access)
      localStorage.setItem("token", access)

      // Fetch user details separately
      try {
        const userResponse = await api.get("/users/self/", {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        })

        if (userResponse.data.success) {
          const user = userResponse.data.data
          localStorage.setItem("user", JSON.stringify(user))
          return { token: access, user }
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error)
        // Still return token even if user fetch fails
        return { token: access, user: null }
      }
    }
    throw new Error(response.data.message)
  },

  async signup(userData) {
    const response = await api.post("/users/sign-up/", userData)
    if (response.data.success) {
      return response.data.data
    }
    throw new Error(response.data.message)
  },

  async getCurrentUser() {
    const response = await api.get("/users/self/")
    if (response.data.success) {
      const user = response.data.data
      localStorage.setItem("user", JSON.stringify(user))
      return user
    }
    throw new Error(response.data.message)
  },

  async updateProfile(userData) {
    const response = await api.patch("/users/self/", userData)
    if (response.data.success) {
      const updatedUser = response.data.data
      localStorage.setItem("user", JSON.stringify(updatedUser))
      return updatedUser
    }
    throw new Error(response.data.message)
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  },

  getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem("token")
  },

  // Add method to refresh user data
  async refreshUserData() {
    try {
      const user = await this.getCurrentUser()
      return user
    } catch (error) {
      console.error("Failed to refresh user data:", error)
      return null
    }
  },
}
