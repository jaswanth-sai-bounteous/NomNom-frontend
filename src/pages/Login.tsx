import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logo from "@/assets/NomNom.png";
import { loginUser } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { syncUserStores } from "@/lib/storeSync";
import { loginFormSchema } from "@/types/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedForm = loginFormSchema.safeParse({ email, password });

    if (!parsedForm.success) {
      toast.error(parsedForm.error.issues[0]?.message ?? "Please check your form");
      return;
    }

    try {
      setLoading(true);
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return firstKey === "cart" || firstKey === "orders" || firstKey === "current-user";
        },
      });
      const data = await loginUser(parsedForm.data);
      saveAuth(data.token, data.user);
      syncUserStores(data.user);
      toast.success("Login successful");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fff6e8_0%,_#fffaf5_45%,_#fef3c7_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden space-y-6 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Welcome Back
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-stone-900">
            Sign in to explore the menu, save your cart, and place orders with ease.
          </h1>
          <p className="max-w-lg text-base leading-8 text-stone-600">
            NomNom is designed to feel simple and polished. Once you log in, you can
            browse dishes, add them to your cart, and keep track of completed orders.
          </p>
        </section>

        <section className="rounded-[36px] border border-stone-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(28,25,23,0.5)] sm:p-10">
          <div className="mb-8 flex items-center gap-4">
            <img
              src={logo}
              alt="NomNom"
              className="size-16 rounded-2xl border border-stone-200 bg-white p-2"
            />
            <div>
              <p className="text-2xl font-semibold text-stone-900">NomNom</p>
              <p className="text-sm text-stone-500">Fresh kitchen favorites</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-2xl border-stone-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-12 rounded-2xl border-stone-300"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-stone-900 text-white hover:bg-amber-600"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-stone-600">
            New to NomNom?{" "}
            <Link to="/signup" className="font-semibold text-amber-700 hover:text-amber-800">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
