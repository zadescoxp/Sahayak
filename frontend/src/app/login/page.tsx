"use client";

import { loginWithGoogle } from "@/firebase/auth/signup";
import Image from "next/image";

export default function SignUp() {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-4">
      <h1 className="font-semibold text-6xl">Sahayak</h1>
      <small className="font-medium text-sm">Login to Sahayak your personal companion</small>
      <Image height={200} width={200} alt="Login" src={"/login.jpg"} className="w-full h-auto rounded-lg" />
      <button className="bg-[#e85d04] text-lg font-medium rounded-lg px-5 py-3 cursor-pointer w-full" onClick={loginWithGoogle}>
        Sign In With Google
      </button>
    </div>
  );
}
