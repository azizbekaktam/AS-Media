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
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        localStorage.setItem("role", userData.role || "user");
      } else {
        localStorage.setItem("role", "user");
      }

      router.push("/Movies");
    } catch (err) {
      setError("Email yoki parol noto‘g‘ri ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-4xl font-extrabold text-center text-white mb-6 drop-shadow-lg">
          Welcome Back 🎬
        </h2>
        <p className="text-white/80 text-center mb-6">
          Kino dunyosiga qaytganingizdan xursandmiz!
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-white/30 bg-white/10 text-white placeholder-white/60 focus:border-pink-400 focus:ring focus:ring-pink-300/30 outline-none p-3 w-full mb-4 rounded-lg"
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-white/30 bg-white/10 text-white placeholder-white/60 focus:border-pink-400 focus:ring focus:ring-pink-300/30 outline-none p-3 w-full mb-4 rounded-lg"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-pink-500/50"
        >
          Login
        </button>

        {error && (
          <p className="text-red-300 text-center mt-3 font-medium">{error}</p>
        )}

        <p className="mt-6 text-sm text-center text-white/80">
          Hali ro‘yxatdan o‘tmaganmisiz?{" "}
          <Link href="/RegPage" className="text-yellow-300 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
