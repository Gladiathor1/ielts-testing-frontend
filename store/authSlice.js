import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tokens: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.tokens = action.payload
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
  },
})

export const { loginStart, loginSuccess, loginFailure } = authSlice.actions
export default authSlice.reducer