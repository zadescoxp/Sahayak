"use client";

import { logoutUser } from "@/firebase/auth/signout";
import AuthMiddleware from "../../utils/middleware";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { modeData } from "../../utils/data";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("User not logged in");
        return;
      }

      const idToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/get_user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const resData = await response.json();
      setName(resData.name);
    });

    return () => unsubscribe(); // clean up listener on unmount
  }, []);
  return (
    <AuthMiddleware>
      <div className="w-full h-full py-20">
        <div className="w-full">
          <span className="flex w-full items-center justify-between">
          <h1 className="text-4xl font-semibold">Hey there, {name}</h1>
          <button onClick={logoutUser} className="bg-[#e85d04] px-5 py-3 rounded-lg cursor-pointer">Logout</button></span>
          <div className="flex flex-col items-center justify-center">
            <h2 className="my-10 text-3xl font-medium">Pick a mode to get started</h2>
            {modeData.map((mode, index) => (
              <Link key={index} href={`/mode${mode.redirect}`} className="w-full flex flex-col items-center justify-center gap-2 mb-10">
                <span className="relative w-full">
                  <Image src={mode.image} height={200} width={200} className="w-full h-auto rounded-lg" alt="" />
                </span>
                <h2 className="text-2xl font-medium">{mode?.title}</h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
