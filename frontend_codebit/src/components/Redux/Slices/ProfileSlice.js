import { createSlice } from "@reduxjs/toolkit"
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
const initialState = {
  user:  null,
  loading: false
}

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, value) {
      state.user = value.payload
    },
    setLoading(state, value) {
      state.loading = value.payload
    },
    setLogout: (state) => {
      state.user = null;
     
      // storage.removeItem('persist:root'); 
    },
  },
})

export const { setUser, setLoading,setLogout } = profileSlice.actions

export default profileSlice.reducer
