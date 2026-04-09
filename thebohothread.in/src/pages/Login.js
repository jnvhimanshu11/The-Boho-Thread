// src/pages/Login.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FiPhone, FiArrowRight, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Login() {
  const { user, loginWithGoogle, setupRecaptcha, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("choose"); // choose | phone | otp
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Welcome! 🎉");
      navigate("/");
    } catch (e) {
      toast.error("Google login failed. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (phone.length < 10) { toast.error("Enter valid phone number"); return; }
    try {
      setLoading(true);
      setupRecaptcha("recaptcha-container");
      await sendOTP(phone);
      setMode("otp");
      setCountdown(60);
      toast.success("OTP sent! ✉️");
    } catch (e) {
      toast.error("Failed to send OTP: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error("Enter 6-digit OTP"); return; }
    try {
      setLoading(true);
      await verifyOTP(otp);
      toast.success("Welcome! 🎉");
      navigate("/");
    } catch (e) {
      toast.error("Invalid OTP. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 40px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div id="recaptcha-container" />

      <div className="glass" style={{ width: "100%", maxWidth: 440, padding: "48px 40px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 16px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            ✦
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900 }}>
            {mode === "otp" ? "Verify OTP" : "Sign In"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: "0.9rem" }}>
            {mode === "otp"
              ? `Enter the 6-digit code sent to ${phone}`
              : "Login to access your account and wishlist"}
          </p>
        </div>

        {mode === "choose" && (
          <>
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--text)",
                padding: "14px",
                fontSize: "1rem",
                marginBottom: 16,
                borderRadius: 12,
              }}
            >
              <FcGoogle size={22} />
              Continue with Google
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Phone */}
            <button
              onClick={() => setMode("phone")}
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: 12,
              }}
            >
              <FiPhone />
              Continue with Phone
            </button>
          </>
        )}

        {mode === "phone" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Mobile Number
              </label>
              <input
                className="input"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Include country code (e.g. +91 for India)
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? "Sending..." : <>Send OTP <FiArrowRight /></>}
            </button>

            <button
              onClick={() => setMode("choose")}
              style={{ marginTop: 16, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", width: "100%", textAlign: "center", fontSize: "0.9rem" }}
            >
              ← Back
            </button>
          </>
        )}

        {mode === "otp" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Enter 6-digit OTP
              </label>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ letterSpacing: "0.3em", fontSize: "1.2rem", textAlign: "center" }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px" }}
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? "Verifying..." : <>Verify & Login <FiArrowRight /></>}
            </button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              {countdown > 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  onClick={handleSendOTP}
                  style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => setMode("phone")}
              style={{ marginTop: 12, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", width: "100%", textAlign: "center", fontSize: "0.9rem" }}
            >
              ← Change Number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
