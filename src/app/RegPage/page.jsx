"use client";
import { useState } from "react";
import { auth, db } from "../../../firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0) {
        if (methods.includes("password")) {
          setError("Bu email allaqachon ro‘yxatdan o‘tgan. Iltimos, login qiling.");
        } else {
          setError(
            `Bu email boshqa usul bilan ro‘yxatdan o‘tgan (${methods.join(
              ", "
            )}). Shu usul bilan kiring.`
          );
        }
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user",
        plan: "free",
        createdAt: new Date().toISOString(),
      });

      router.push("/LoginPage");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-email") {
        setError("Email formati noto‘g‘ri.");
      } else if (err.code === "auth/weak-password") {
        setError("Parol juda zaif (kamida 6 ta belgi bo‘lishi kerak).");
      } else {
        setError("Ro‘yxatdan o‘tishda xatolik ❌");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-full max-w-md border border-white/20">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-md">
          Create Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/20 border border-white/30 focus:border-white/70 placeholder-white/70 text-white outline-none p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-white/50 transition"
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/20 border border-white/30 focus:border-white/70 placeholder-white/70 text-white outline-none p-3 w-full mb-6 rounded-lg focus:ring-2 focus:ring-white/50 transition"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-lg hover:bg-indigo-100 transition"
        >
          Register
        </button>

        {error && (
          <p className="text-red-200 text-center mt-3 bg-red-500/30 rounded-lg py-2 text-sm">
            {error}
          </p>
        )}

        <p className="mt-6 text-sm text-center text-white/80">
          Allaqachon akkauntingiz bormi?{" "}
          <Link href="/LoginPage" className="text-white font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
