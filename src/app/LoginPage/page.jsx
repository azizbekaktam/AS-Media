"use client";
import { useState } from "react";
import { auth, db } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      const userSnap = await getDoc(doc(db, "users", user.uid));
      localStorage.setItem("role", userSnap.exists() ? userSnap.data().role : "user");

      router.push("/Movies");
    } catch (error) {
      setError("Email yoki parol noto‘g‘ri ❌");
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
          As-Media 🎬
        </h2>

        <p className="text-gray-400 text-center mb-7">
          Hisobingizga kiring va filmlardan rohatlaning!
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
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
            placeholder="Parolingiz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Yuklanmoqda..." : "Kirish"}
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
          Profilingiz yo‘qmi?{" "}
          <Link href="/RegPage" className="text-blue-400 font-semibold hover:underline">
            Ro‘yxatdan o‘ting
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
