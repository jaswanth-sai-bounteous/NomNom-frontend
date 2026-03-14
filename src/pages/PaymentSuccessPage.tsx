import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f5fff7_0%,_#ffffff_45%,_#dcfce7_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[36px] border border-emerald-200 bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(20,83,45,0.35)] sm:p-10">
          <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-900">
            Payment successful
          </h1>
          <p className="mt-4 text-base leading-8 text-stone-600">
            Stripe confirmed your payment. You can continue browsing or head to your
            orders page to review what comes next.
          </p>
          {sessionId ? (
            <p className="mt-4 break-all text-sm text-stone-500">
              Session ID: {sessionId}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="h-12 rounded-full bg-stone-900 px-6 hover:bg-emerald-600">
              <Link to="/orders">View orders</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6">
              <Link to="/menu">Back to menu</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
