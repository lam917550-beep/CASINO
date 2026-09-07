export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full bg-dark-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
