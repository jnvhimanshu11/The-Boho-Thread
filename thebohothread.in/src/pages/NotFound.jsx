import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page-container py-32 text-center animate-fadeIn">
      <div className="inline-flex w-32 h-32 rounded-full bg-indigo-50 items-center justify-center mb-8">
        <span className="font-sora text-5xl font-bold text-indigo-300">404</span>
      </div>
      <h1 className="font-sora text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-400 mb-10 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={() => navigate(-1)} className="btn-secondary py-3 px-8">← Go Back</button>
        <Link to="/"        className="btn-primary  py-3 px-8">Go Home</Link>
        <Link to="/products" className="btn-ghost   py-3 px-8 border border-gray-200 rounded-xl">Browse Products</Link>
      </div>
    </div>
  );
}
