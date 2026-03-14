import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_45%,_#ffedd5_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[36px] border border-orange-200 bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(154,52,18,0.28)] sm:p-10">
          <AlertCircle className="mx-auto size-16 text-orange-500" />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-900">
            Payment canceled
          </h1>
          <p className="mt-4 text-base leading-8 text-stone-600">
            No charge was completed. Your cart is still there, so you can return and
            try again whenever you are ready.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="h-12 rounded-full bg-stone-900 px-6 hover:bg-orange-500">
              <Link to="/cart">Return to cart</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6">
              <Link to="/menu">Keep browsing</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
