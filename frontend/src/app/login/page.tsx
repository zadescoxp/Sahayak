"use client";

import { loginWithGoogle } from "@/firebase/auth/signup";

export default function SignUp() {
  return (
    <div className="">
      <button className="" onClick={loginWithGoogle}>
        Sign In With Google
      </button>
    </div>
  );
}
