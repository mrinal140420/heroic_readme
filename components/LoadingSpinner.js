// components/LoadingSpinner.js
export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center mt-6 text-gray-600">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-sm">{label}</p>
    </div>
  );
}
