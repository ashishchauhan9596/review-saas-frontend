"use client";

import { useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Shield, Lock, Fingerprint } from "lucide-react";

function HomeContent() {
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const error = searchParams.get("unauthorized") || searchParams.get("error");
  const showError = error === "unauthorized";

  useEffect(() => {
    if (error === "unauthorized") {
      if (clerk.user) {
        clerk.signOut();
      }
      
      // Auto-clear the error from URL after 10 seconds to hide the toast
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clerk]);

  const handleSignInWithGoogle = async () => {
    try {
      if (clerk.user) {
        await clerk.signOut();
      }
      console.log("Calling authenticateWithRedirect using clerk instance...");
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert("Failed to sign in with Google: " + errorMessage);
    }
  };

  return (
    <div className="login-page">
      {/* Background effects */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />
      <div className="login-bg-grid" />

      {/* Error toast */}
      {showError && (
        <div className="login-error-toast">
          <Shield className="w-4 h-4" />
          <span>Access denied — unauthorized account</span>
        </div>
      )}

      {/* Card */}
      <div className="login-card">
        {/* Shield icon */}
        <div className="login-shield">
          <div className="login-shield-inner">
            <Shield className="w-6 h-6 text-indigo-300" />
          </div>
        </div>

        {/* Title */}
        <h1 className="login-title">Super Admin</h1>
        <p className="login-subtitle">ReviewStack Management Console</p>

        {/* Google button */}
        <button className="login-google-btn" type="button" onClick={handleSignInWithGoogle}>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Restricted access notice */}
        <p className="login-restricted">
          <Lock className="w-3 h-3" />
          Restricted to authorized administrators only
        </p>
      </div>

      {/* Bottom bar */}
      <div className="login-footer">
        <span className="login-footer-item">
          <Lock className="w-3 h-3" />
          End-to-end encrypted
        </span>
        <span className="login-footer-dot" />
        <span className="login-footer-item">
          <Fingerprint className="w-3 h-3" />
          OAuth 2.0
        </span>
        <span className="login-footer-dot" />
        <span className="login-footer-item">
          © 2026 ReviewStack
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-spinner" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
