import { useHealth } from "../hooks";

export function HealthPage() {
  const { data, isLoading, isError, error } = useHealth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100 text-center transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
          System Status
        </h1>

        {/* STATE: LOADING */}
        {isLoading && (
          <div className="flex flex-col items-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 animate-pulse">
              Connecting to backend...
            </p>
          </div>
        )}

        {/* STATE: ERROR */}
        {isError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <div className="text-red-500 text-5xl mb-2">❌</div>
            <h3 className="text-lg font-bold text-red-700">
              Connection Failed
            </h3>
            <p className="text-sm text-red-600 mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Check if the backend is running on port 3000.
            </p>
          </div>
        )}

        {/* STATE: SUCCESS */}
        {data && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">✅</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-green-700">
                {data.message}
              </h2>
              <p className="text-sm text-gray-400 mt-1 font-mono">
                Server Time: {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Status: {data.status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
