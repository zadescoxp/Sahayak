import { signOut } from "firebase/auth";
import { auth } from "../config";

export const logoutUser = async () => {
  try {
    await signOut(auth);

    // Optional: clear cookies if you're using them for auth
    document.cookie = "token=; Max-Age=0; path=/login";

    console.log("User logged out!");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
