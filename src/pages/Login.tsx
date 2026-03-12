import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "../assets/NomNom.png";

type LoginResponse = {
  token: string;
  user: { id: string; name: string; email: string };
};

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      const loginData = data as LoginResponse;

      localStorage.setItem("token", loginData.token);

      toast.success("Login successful 🎉");

      setTimeout(() => {
        navigate("/home");
      }, 1000);

    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8E1]">

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">

        <div className="flex justify-center mb-6">
          <img src={logo} alt="NomNom" className="w-44" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#E53935] mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E53935]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#E53935]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E53935] hover:bg-[#FFC107] text-white py-2 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#E53935] font-semibold">
            Sign up
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Login;