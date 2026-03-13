import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <p className="text-2xl font-semibold tracking-tight text-white">NomNom</p>
          <p className="max-w-sm text-sm leading-7 text-stone-400">
            A warm and modern restaurant experience with handcrafted meals,
            cozy interiors, and flavors that feel special every time.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400">
            Explore
          </p>
          <div className="flex flex-col gap-3 text-sm text-stone-300">
            <Link to="/home" className="transition hover:text-white">
              Home
            </Link>
            <Link to="/about" className="transition hover:text-white">
              About
            </Link>
            <Link to="/menu" className="transition hover:text-white">
              Menu
            </Link>
            <Link to="/orders" className="transition hover:text-white">
              Orders
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400">
            Visit
          </p>
          <div className="space-y-2 text-sm text-stone-300">
            <p>12 Market Street, Hyderabad</p>
            <p>Open daily: 11:00 AM to 11:00 PM</p>
            <p>contact@nomnom.com</p>
            <p>+91 90000 12345</p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 px-4 py-5 text-center text-sm text-stone-500">
        {new Date().getFullYear()} NomNom. Made for people who love good food.
      </div>
    </footer>
  );
};

export default Footer;
