export default function ConfirmacaoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-8 py-10 text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 rounded-full mb-4 animate-pulse" />
            <div className="h-7 bg-white/30 rounded-lg w-3/4 mx-auto animate-pulse" />
            <div className="h-5 bg-white/20 rounded-lg w-1/3 mx-auto mt-3 animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="px-8 py-8 space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}

            {/* Message Skeleton */}
            <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-xl">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
