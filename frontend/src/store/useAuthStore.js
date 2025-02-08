import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import {io} from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"
export const useAuthStore = create((set, get) => ({
    authUser: null,
    onlineUsers: [],
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,
    checkAuth: async() => {
        try {
            const res = axiosInstance.get("/auth/check")
            set({authUser: res.data})
            localStorage.setItem("loggedIn", "true")
            get().connectSocket()
        } catch (error) {
            set({authUser: null})
            console.log(error)
        } finally{
            set({isCheckingAuth: false})
        }
    },
    signup: async(data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({authUser: res.data})
            toast.success("Account created successfully")
            get().connectSocket()
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            set({isSigningUp: false})
        }
    },
    login : async (data) => {
        set({isLoggingIn: true})
        try {
            console.log("res---->", data)
            const res = await axiosInstance.post("auth/login", data)
            set({authUser: res.data})
            toast.success("Logged in successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error?.response?.data.message)
        } finally {
            set({isLoggingIn: false})
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("auth/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
            localStorage.clear();
            get().disconnectSocket()
        } catch (error) {
            console.log('Error in logout', error)
            toast.error(error.response.data.message)
        }
    },
    updateProfile: async (data) => {
        set({isUpdatingProfile: true})
        try {
            console.log("profilepic===>", data)
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser: res.data})
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        } finally {
            set({isUpdatingProfile: false})
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
}))