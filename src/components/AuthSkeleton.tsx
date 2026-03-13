const AuthSkeleton = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#fff6e8_0%,_#fffaf5_45%,_#fef3c7_100%)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden space-y-5 lg:block">
          <div className="h-4 w-36 animate-pulse rounded-full bg-stone-200" />
          <div className="h-14 w-full max-w-xl animate-pulse rounded-[28px] bg-stone-200" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded-full bg-stone-200" />
          <div className="h-4 w-4/5 max-w-lg animate-pulse rounded-full bg-stone-200" />
        </div>

        <div className="space-y-5 rounded-[36px] border border-stone-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(28,25,23,0.5)] sm:p-10">
          <div className="h-16 w-48 animate-pulse rounded-[20px] bg-stone-200" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200" />
              <div className="h-12 w-full animate-pulse rounded-2xl bg-stone-200" />
            </div>
          ))}
          <div className="h-12 w-full animate-pulse rounded-full bg-stone-300" />
        </div>
      </div>
    </div>
  );
};

export default AuthSkeleton;
