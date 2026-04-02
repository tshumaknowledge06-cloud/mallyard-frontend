export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">

      <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>

      <p className="text-gray-500 mt-4">
        Loading...
      </p>

    </div>
  )
}