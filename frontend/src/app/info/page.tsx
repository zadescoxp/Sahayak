"use client";

import { useState } from "react";
import { auth } from "../../firebase/config";
import AuthMiddleware from "../../../utils/middleware";

export default function Info() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    religion: "",
    language: "",
    state: "",
    photo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.warn("User not logged in");
      return;
    }

    const idToken = await user.getIdToken();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/store_user`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      window.location.href = "/";
    }
    const resData = await response.json();
    console.log("✅ Response from backend:", resData);
  };

  const languages = [
    "English",
    "Hindi",
    "Bengali",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Punjabi",
    "Sanskrit",
    "Tamil",
    "Telugu",
    "Maithili",
    "Urdu",
  ];

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  return (
    <AuthMiddleware>
      <div className="flex flex-col items-center justify-center h-full gap-4 w-full max-sm:w-[95%]">
        <h1 className="text-2xl font-semibold text-center">
          Enter your information
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-md mx-auto"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            required
            value={formData.age}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          />

          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input
            type="text"
            name="religion"
            placeholder="Religion"
            required
            value={formData.religion}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          />

          <select
            name="language"
            required
            value={formData.language}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            name="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            name="photo"
            required
            value={formData.photo}
            onChange={handleChange}
            className="border-4 px-5 py-3 rounded-lg w-full "
          >
            <option value="">Select Photo</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                Photo {num}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </AuthMiddleware>
  );
}
