// utils/checkToken.js
import axiosInstance from './axiosConfig'
import Cookies from 'js-cookie'

export const checkTokenValidity = async (setLoading) => {
  const accessToken = Cookies.get('accessToken')
  const refreshToken = Cookies.get('refreshToken')

  if (!accessToken && !refreshToken) {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    return
  }
  setLoading(false)

//   try {
//     await axiosInstance.get('/api/users/test-token')
//     if (window.location.pathname === '/login') {
//       window.location.href = '/'
//     }
//   } catch (error) {
//     if (error.response?.status === 401 && refreshToken) {
//       try {
//         const response = await axiosInstance.post('/api/users/token/refresh/', {
//           refresh: refreshToken
//         })
//         const { access } = response.data
//         Cookies.set('accessToken', access, { secure: true })
//         if (window.location.pathname === '/login') {
//           window.location.href = '/'
//         }
//       } catch (refreshError) {
//         Cookies.remove('accessToken')
//         Cookies.remove('refreshToken')
//         if (window.location.pathname !== '/login') {
//           window.location.href = '/login'
//         }
//       }
//     } else {
//       Cookies.remove('accessToken')
//       Cookies.remove('refreshToken')
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login'
//       }
//     }
//   } finally {
//     setLoading(false)
//   }
}