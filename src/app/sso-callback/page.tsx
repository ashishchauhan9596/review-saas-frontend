import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="login-page">
      <div className="login-spinner" />
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    </div>
  );
}
