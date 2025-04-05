"use client";

import { loginWithGoogle } from "@/firebase/auth/signup";
import Image from "next/image";

export default function SignUp() {
  return (
    <main className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image.png"
          alt="Background pattern"
          fill
          className="object-cover"
          priority
          quality={100}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-6 flex flex-col items-center justify-center space-y-8">
        {/* Welcome Text and Slogan */}
        <div className="text-center space-y-4 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          {/* Slogan with decorative elements */}
          <div className="relative py-1">
            <p className="text-lg font-medium text-gray-600 italic">
              Age with Purpose, Connect with Care
            </p>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={loginWithGoogle}
          className="group relative w-full max-w-sm bg-white/90 backdrop-blur-sm px-8 py-4 rounded-xl text-sm font-medium 
                   hover:shadow-md active:shadow-sm transition-all duration-200 ease-out
                   border border-gray-200 hover:border-gray-300 text-gray-600
                   flex items-center justify-center space-x-3"
        >
          {/* Button Background Hover Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"></div>

          {/* Button Content */}
          <div className="relative flex items-center justify-center space-x-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-600">Sign in with Google</span>
          </div>
        </button>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 mt-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
}
