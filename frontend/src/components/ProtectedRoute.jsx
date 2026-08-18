import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading, isInitializing } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // Show dark glassmorphism loading screen while re-hydrating on page refresh
  if (loading || isInitializing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="relative p-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center gap-4 text-center max-w-sm w-full">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Verifying Authentication
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Restoring your active session details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to default home if role mismatch
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;