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
        setError("Bu email allaqachon ro‘yxatdan o‘tgan. Iltimos, login qiling.");
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
      if (err.code === "auth/invalid-email") {
        setError("Email formati noto‘g‘ri.");
      } else if (err.code === "auth/weak-password") {
        setError("Parol juda zaif (kamida 6 ta belgi).");
      } else {
        setError("Ro‘yxatdan o‘tishda xatolik ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-[#0d0d0f] via-[#1a1a1d] to-[#1f1f22] px-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#121215]/90 backdrop-blur-xl border border-white/10 
                   rounded-3xl shadow-2xl p-10 max-w-md w-full"
      >
        <h2 className="text-3xl font-extrabold text-white text-center mb-3">
          Ro‘yxatdan o‘tish 🎬
        </h2>

        <p className="text-gray-400 text-center mb-7">
          Akkaunt yarating va filmlar olamiga qo‘shiling!
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
            className="inputStyle"
            placeholder="Email manzilingiz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="inputStyle"
            placeholder="Parol (kamida 6 ta belgi)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Yuklanmoqda..." : "Ro‘yxatdan o‘tish"}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center font-medium mt-1"
            >
              {error}
            </motion.p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Akkauntingiz bormi?{" "}
          <Link href="/LoginPage" className="text-blue-400 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
