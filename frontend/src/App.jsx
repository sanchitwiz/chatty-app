import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import HomePage from './pages/Homepage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast' // Import Toaster
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const { authUser, isCheckingAuth, checkAuth, onlineUsers } = useAuthStore()
  const { theme } = useThemeStore();

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({ authUser });
  

  // Display loader if authentication status is being checked
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div data-theme={`${theme}`}>
      <Navbar />
      <Routes>
        {/* Redirect to login if the user is not authenticated */}
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to='/' />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>

      {/* Ensure Toaster is globally accessible */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}

export default App