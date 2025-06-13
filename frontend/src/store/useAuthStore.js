import { create } from "zustand";
import instance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isAuthenticated: true,

  
  checkAuth: async () => {
    try{
        const res = await instance.get("/auth/check");

        set({user: res.data});

    }catch(err){
        console.error(err);
        set({user: null});
    }
    finally {
        set({isAuthenticated: false});
    }
    },
}));
export default useAuthStore;