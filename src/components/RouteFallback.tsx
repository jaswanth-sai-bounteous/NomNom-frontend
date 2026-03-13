import AuthSkeleton from "@/components/AuthSkeleton";
import PageSkeleton from "@/components/PageSkeleton";

type RouteFallbackProps = {
  variant?: "page" | "auth";
};

const RouteFallback = ({ variant = "page" }: RouteFallbackProps) => {
  if (variant === "auth") {
    return <AuthSkeleton />;
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageSkeleton />
    </div>
  );
};

export default RouteFallback;
