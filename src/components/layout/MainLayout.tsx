import { Outlet } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_35%,_#fffdf8_100%)] text-stone-900">
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
