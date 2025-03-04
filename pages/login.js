import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice'
import axiosInstance from '../utils/axiosConfig'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import { checkTokenValidity } from '../utils/checkToken'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    const sessionCode = Cookies.get('sessionCode')
    if (!sessionCode) {
      router.push('/code')
    } else {
      checkTokenValidity()
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())

    try {
      const response = await axiosInstance.post('/api/users/login/', { email, password })

      if (response.status === 200) {
        const { refresh, access } = response.data
        console.log('Storing tokens:', { access, refresh }) // Debug tokens
        
        Cookies.set('accessToken', access, { 
          secure: true,
          sameSite: 'Lax'
        })
        Cookies.set('refreshToken', refresh, {
          secure: true,
          sameSite: 'Lax'  
        })
        
        // Verify tokens were stored
        console.log('Stored tokens:', {
          access: Cookies.get('accessToken'),
          refresh: Cookies.get('refreshToken')
        })
        
        dispatch(loginSuccess({ refresh, access }))
        router.push('/')
      }
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.detail || error.message))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="w-full text-center py-2 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create new account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}