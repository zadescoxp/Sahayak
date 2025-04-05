import { auth, googleProvider } from "../config";
import { signInWithPopup, getAdditionalUserInfo } from "firebase/auth";

const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

  if (isNewUser) {
    // Handle new user sign-up logic here
    console.log("New user signed up:", user);
    window.location.href = "/info";
  } else {
    window.location.href = "/";
  }

  console.log("User Info:", user);
  console.log("ID Token:", idToken);
  console.log("Is New User:", isNewUser);
  // etc.
};

export { loginWithGoogle };
