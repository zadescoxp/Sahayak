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
      <div>
        <button onClick={logoutUser}>Logout</button>
        <div className="">
          <h1>Hey there, {name}</h1>
          <div className="flex flex-col items-center justify-center">
            {modeData.map((mode, index) => (
              <Link key={index} href={mode.redirect}>
                <span className="relative">
                  <Image src={mode.image} fill alt="" />
                </span>
                <h2>{mode?.title}</h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthMiddleware>
  );
}
