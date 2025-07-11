import Navbar from "./Components/Navbar"
import {Routes , Route} from "react-router-dom"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingPage"
import useAuthStore from "./store/useAuthStore"
import { useEffect } from "react"
import {Loader} from "lucide-react";
import { Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser , checkAuth , isAuthnicated} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isAuthnicated && !authUser) return(
    <div className="flex justify-center items-center h-screen">
    <Loader className="size-10 animate-spin"/>
  </div>
)
  return (
    <div >
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={ <ProfilePage /> } />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
       <Toaster />
    </div>
  );
};

export default App