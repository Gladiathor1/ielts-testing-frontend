import axios from 'axios'
import Cookies from 'js-cookie'

const axiosInstance = axios.create({
  baseURL: 'http://100.28.217.234',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    console.log('Request:', {
      url: config.url,
      headers: config.headers
    })
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get('refreshToken')
      if (refreshToken) {
        try {
            console.log("trying to refresh token")
          const response = await axios.post('http://127.0.0.1:8000/api/users/token/refresh/', {
            refresh: refreshToken
          })
          const { access, refresh } = response.data
          Cookies.set('accessToken', access, { secure: true })
          Cookies.set('refreshToken', refresh, { secure: true })
          error.config.headers['Authorization'] = `Bearer ${access}`
          return axiosInstance(error.config)
        } catch (refreshError) {
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
          window.location.href = '/login'
        }
      } else {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance