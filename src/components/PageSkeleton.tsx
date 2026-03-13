type PageSkeletonProps = {
  blocks?: number;
  cards?: number;
};

const PageSkeleton = ({ blocks = 2, cards = 3 }: PageSkeletonProps) => {
  return (
    <div className="space-y-10 py-4">
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded-full bg-stone-200" />
        <div className="h-10 w-72 animate-pulse rounded-2xl bg-stone-200" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-stone-200" />
      </div>

      {Array.from({ length: blocks }).map((_, blockIndex) => (
        <div key={blockIndex} className="space-y-5">
          <div className="h-48 animate-pulse rounded-[32px] bg-stone-200" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: cards }).map((_, cardIndex) => (
              <div
                key={`${blockIndex}-${cardIndex}`}
                className="h-[320px] animate-pulse rounded-[28px] bg-stone-200"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageSkeleton;
