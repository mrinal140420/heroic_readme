// components/ErrorAlert.js
export default function ErrorAlert({ message }) {
  return (
    <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4">
      ❌ {message}
    </div>
  );
}
