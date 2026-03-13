type InfiniteLoaderProps = {
  isVisible: boolean;
};

const InfiniteLoader = ({ isVisible }: InfiniteLoaderProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[320px] animate-pulse rounded-[28px] bg-stone-200"
        />
      ))}
    </div>
  );
};

export default InfiniteLoader;
