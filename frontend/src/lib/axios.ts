// import axios from 'axios'

// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000/api',
//   headers: { 'Content-Type': 'application/json' },
// })

// // Attach access token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token')

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }

//   return config
// })

// // 🔄 Auto refresh token
// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const original = error.config

//     if (error.response?.status === 401 && !original._retry) {
//       original._retry = true

//       const refresh = localStorage.getItem('refresh_token')

//       if (refresh) {
//         try {
//           const { data } = await axios.post(
//             'http://127.0.0.1:8000/api/auth/token/refresh/',
//             { refresh }
//           )

//           localStorage.setItem('access_token', data.access)

//           original.headers.Authorization = `Bearer ${data.access}`

//           return api(original)

//         } catch (err) {
//           localStorage.clear()
//           window.location.href = '/login'
//         }
//       } else {
//         window.location.href = '/login'
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// export default api

// import axios from "axios"

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// /**
//  * =========================
//  * REQUEST INTERCEPTOR
//  * =========================
//  * Ajoute automatiquement le token JWT
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token")

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// /**
//  * =========================
//  * RESPONSE INTERCEPTOR
//  * =========================
//  * Gère automatiquement le refresh token
//  */
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config

//     // Si erreur 401 et pas encore retry
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true

//       const refreshToken = localStorage.getItem("refresh_token")

//       if (!refreshToken) {
//         localStorage.clear()
//         window.location.href = "/login"
//         return Promise.reject(error)
//       }

//       try {
//         const { data } = await axios.post(
//           "http://127.0.0.1:8000/api/auth/token/refresh/",
//           {
//             refresh: refreshToken,
//           }
//         )

//         // update token
//         localStorage.setItem("access_token", data.access)

//         // update header et retry request
//         originalRequest.headers.Authorization = `Bearer ${data.access}`

//         return api(originalRequest)
//       } catch (err) {
//         localStorage.clear()
//         window.location.href = "/login"
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// export default api

import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refresh_token")

      if (!refreshToken) {
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        )

        localStorage.setItem("access_token", data.access)

        originalRequest.headers.Authorization = `Bearer ${data.access}`

        return api(originalRequest)
      } catch (err) {
        localStorage.clear()
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api