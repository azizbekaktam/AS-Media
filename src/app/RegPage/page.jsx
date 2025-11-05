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
import { motion } from "framer-motion";

export default function RegPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.length > 0) {
        if (methods.includes("password")) {
          setError("Bu email allaqachon ro‘yxatdan o‘tgan. Iltimos, login qiling.");
        } else {
          setError(
            `Bu email boshqa usul bilan ro‘yxatdan o‘tgan (${methods.join(", ")}). Shu usul bilan kiring.`
          );
        }
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-4xl font-extrabold text-white text-center mb-4 drop-shadow-md">
          Ro‘yxatdan o‘tish 🎬
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Hisob yaratish orqali kino dunyosiga qo‘shiling!
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400 focus:ring focus:ring-gray-500/30 outline-none p-3 rounded-xl transition"
            required
          />
          <input
            type="password"
            placeholder="Parol (kamida 6 ta belgi)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-400 focus:ring focus:ring-gray-500/30 outline-none p-3 rounded-xl transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl shadow-md transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Yuklanmoqda..." : "Register"}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center font-medium mt-2 bg-red-900/20 py-2 rounded-lg text-sm"
            >
              {error}
            </motion.p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Allaqachon akkauntingiz bormi?{" "}
          <Link
            href="/LoginPage"
            className="text-blue-400 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
