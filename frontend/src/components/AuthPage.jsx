import { useEffect, useState } from "react";
import { FileText, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { api, endpoints } from "../api";

export default function AuthPage({ onAuthenticated }) {
  const [isVerificationPage] = useState(() =>
    new URLSearchParams(window.location.search).has("verifyToken"),
  );
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleVerification = (event) => {
      if (event.key !== "docuchat-email-verified" || !event.newValue) return;
      const verifiedUser = JSON.parse(event.newValue).user;
      localStorage.setItem("token", verifiedUser.token);
      localStorage.setItem("user", JSON.stringify(verifiedUser));
      onAuthenticated(verifiedUser);
    };

    window.addEventListener("storage", handleVerification);
    return () => window.removeEventListener("storage", handleVerification);
  }, [onAuthenticated]);

  useEffect(() => {
    const verificationToken = new URLSearchParams(window.location.search).get(
      "verifyToken",
    );
    if (!verificationToken) return;

    const attemptKey = `docuchat-verification-attempt-${verificationToken}`;
    if (sessionStorage.getItem(attemptKey)) return;
    sessionStorage.setItem(attemptKey, "pending");

    api
      .get(`${endpoints.auth.verifyEmail}/${verificationToken}`)
      .then((response) => {
        setNotice(response.data.message);
        localStorage.setItem(
          "docuchat-email-verified",
          JSON.stringify({ user: response.data, timestamp: Date.now() }),
        );
      })
      .catch((requestError) =>
        (() => {
          sessionStorage.removeItem(attemptKey);
          setError(
            requestError.response?.data?.error ||
              "This verification link is invalid or expired.",
          );
        })(),
      )
      .finally(() =>
        window.history.replaceState({}, "", window.location.pathname),
      );
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (mode === "reset" && form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        mode === "forgot"
          ? endpoints.auth.forgotPassword
          : mode === "reset"
            ? endpoints.auth.resetPassword
            : endpoints.auth[mode];
      const payload =
        mode === "reset"
          ? { email: form.email, otp, password: form.password }
          : mode === "forgot"
            ? { email: form.email }
            : form;
      const response = await api.post(endpoint, payload);
      if (mode === "forgot" || mode === "reset") {
        setNotice(response.data.message);
        if (mode === "forgot") {
          setMode("reset");
        } else {
          setMode("login");
          setForm({ name: "", email: "", password: "" });
          setOtp("");
          setConfirmPassword("");
        }
        return;
      }
      if (mode === "register") {
        setNotice(response.data.message);
        setMode("verify");
        setForm({ name: "", email: form.email, password: "" });
        return;
      }
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      onAuthenticated(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to connect. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isVerificationPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#193b35] p-6 font-['Geist'] text-[#182321]">
        <div className="w-full max-w-[480px] text-center">
          {error ? (
            <div className="rounded-[14px] border border-[#e6b7aa] bg-[#fffef9] p-8 shadow-[0_24px_70px_rgba(8,35,29,.24)] sm:p-[42px_38px]">
              <div className="mx-auto mb-[22px] grid h-[72px] w-[72px] place-items-center rounded-full bg-[#fbe7e1] text-[#a43e2b]">
                <EyeOff size={28} />
              </div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#337b66]">
                DocuChat AI
              </p>
              <h1 className="font-['Geist'] text-[30px] font-semibold leading-tight text-[#a43e2b]">
                Verification link expired
              </h1>
              <p className="mx-auto mt-3 max-w-[340px] leading-relaxed text-[#6d7973]">
                {error}
              </p>
            </div>
          ) : (
            <div className="rounded-[14px] border border-[#dce1d6] bg-[#fffef9] p-8 shadow-[0_24px_70px_rgba(8,35,29,.24)] sm:p-[42px_38px]">
              <div className="mx-auto mb-[22px] grid h-[72px] w-[72px] place-items-center rounded-full bg-[#e8d88c] text-[#236b57]">
                <CheckCircle size={32} />
              </div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#337b66]">
                DocuChat AI
              </p>
              <h1 className="font-['Geist'] text-[30px] font-semibold leading-tight">
                {notice || "Verifying your email..."}
              </h1>
              <p className="mx-auto mt-3 max-w-[340px] leading-relaxed text-[#6d7973]">
                Your email has been confirmed. Your original DocuChat tab will
                open your dashboard automatically.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen bg-[#f5f4ee] font-['Geist'] text-[#182321] md:grid-cols-[1.1fr_.9fr]">
      <section className="relative flex min-h-[330px] flex-col justify-between overflow-hidden bg-[#193b35] p-6 text-[#f6f4e9] sm:p-10 md:min-h-screen md:px-[clamp(28px,7vw,110px)] md:py-[42px]">
        <div className="absolute right-[-15%] top-[15%] h-[480px] w-[480px] rounded-full border border-[rgba(235,220,146,.35)] shadow-[0_0_0_42px_rgba(235,220,146,.07),0_0_0_84px_rgba(235,220,146,.05)]" />
        <div className="relative z-[1] flex items-center gap-3 font-['Geist'] text-[19px] font-semibold">
          <span className="grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-[#e8d88c] text-[#193b35]">
            <FileText className="w-5" />
          </span>
          DocuChat AI
        </div>
        <div className="relative z-[1] my-auto max-w-[590px] md:my-0">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a8c7a0]">
            Your document workspace
          </p>
          <h1 className="my-[18px] font-['Geist'] text-[44px] font-semibold leading-[.98] sm:text-[56px] lg:text-[clamp(42px,5.5vw,78px)]">
            Read less.
            <br />
            <em className="not-italic text-[#e8d88c]">Understand more.</em>
          </h1>
          <p className="max-w-[410px] text-[17px] leading-relaxed text-[#c3d2c5]">
            Keep every important PDF close, searchable, and ready for a
            thoughtful conversation.
          </p>
        </div>
        <div className="relative z-[1] hidden items-center gap-2.5 font-['Geist'] text-[#e8d88c] md:flex">
          <span className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(232,216,140,.55)] text-xs">
            PDF
          </span>
          <span className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(232,216,140,.55)] text-xs">
            AI
          </span>
          <span className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(232,216,140,.55)] text-xs">
            +
          </span>
        </div>
      </section>
      <section className="grid min-h-[calc(100vh-330px)] place-items-center p-6 sm:p-8 md:min-h-screen">
        <div className="w-full max-w-[430px]">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#337b66]">
            {mode === "login"
              ? "Welcome back"
              : mode === "register"
                ? "Start your library"
                : mode === "verify"
                  ? "Almost there"
                  : "Account recovery"}
          </p>
          <h2 className="mt-2 mb-2 font-['Geist'] text-[32px] font-semibold leading-tight">
            {mode === "login"
              ? "Sign in to your workspace"
              : mode === "register"
                ? "Create your account"
                : mode === "verify"
                  ? "Verify your email"
                  : mode === "forgot"
                    ? "Forgot your password?"
                    : "Reset your password"}
          </h2>
          <p className="mb-7 text-[#6d7973]">
            {mode === "login"
              ? "Your saved documents are waiting."
              : mode === "register"
                ? "A private home for everything you need to read."
                : mode === "verify"
                  ? "Open the verification link sent to your email."
                  : mode === "forgot"
                    ? "Enter your email and we will send you a six-digit reset code."
                    : "Enter the code from your email and choose a new password."}
          </p>
          {mode === "verify" ? (
            <p className="rounded-lg bg-[#edf4eb] p-3 text-[13px] text-[#236b57]">
              {notice}
            </p>
          ) : (
            <form onSubmit={submit} className="grid gap-[18px]">
              {mode === "register" && (
                <label className="grid gap-2 text-[13px] font-bold text-[#395048]">
                  Name
                  <input
                    className="w-full rounded-lg border border-[#d5d9ce] bg-[#fffef9] px-[15px] py-[14px] font-['Geist'] outline-none transition focus:border-[#337b66] focus:ring-4 focus:ring-[#337b6620]"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </label>
              )}
              {mode !== "reset" ? (
                <label className="grid gap-2 text-[13px] font-bold text-[#395048]">
                  Email
                  <input
                    className="w-full rounded-lg border border-[#d5d9ce] bg-[#fffef9] px-[15px] py-[14px] font-['Geist'] outline-none transition focus:border-[#337b66] focus:ring-4 focus:ring-[#337b6620]"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </label>
              ) : (
                <label className="grid gap-2 text-[13px] font-bold text-[#395048]">
                  Email
                  <input type="email" value={form.email} readOnly />
                </label>
              )}
              {mode === "reset" && (
                <label>
                  Reset OTP
                  <input
                    className="w-full rounded-lg border border-[#d5d9ce] bg-[#fffef9] px-[15px] py-[14px] font-['Geist'] outline-none transition focus:border-[#337b66] focus:ring-4 focus:ring-[#337b6620]"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter the 6-digit code"
                  />
                </label>
              )}
              {mode !== "forgot" && (
                <label className="grid gap-2 text-[13px] font-bold text-[#395048]">
                  Password
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-[#d5d9ce] bg-[#fffef9] px-[15px] py-[14px] pr-12 font-['Geist'] outline-none transition focus:border-[#337b66] focus:ring-4 focus:ring-[#337b6620]"
                      required
                      minLength={6}
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="At least 6 characters"
                    />
                    <button
                      className="absolute right-2 top-2 rounded-lg border-0 bg-transparent p-2 text-[#718079]"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              )}
              {mode === "reset" && (
                <label>
                  Confirm password
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-[#d5d9ce] bg-[#fffef9] px-[15px] py-[14px] pr-12 font-['Geist'] outline-none transition focus:border-[#337b66] focus:ring-4 focus:ring-[#337b6620]"
                      required
                      minLength={6}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter your new password again"
                    />
                    <button
                      className="absolute right-2 top-2 rounded-lg border-0 bg-transparent p-2 text-[#718079]"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>
              )}
              {notice && (
                <p className="rounded-lg bg-[#edf4eb] p-3 text-[13px] text-[#236b57]">
                  {notice}
                </p>
              )}
              {error && (
                <p className="rounded-lg bg-[#fbe7e1] p-3 text-[13px] text-[#a43e2b]">
                  {error}
                </p>
              )}
              <button
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border-0 bg-[#236b57] p-[15px] font-semibold text-white transition hover:bg-[#1b5848] disabled:cursor-wait disabled:opacity-60"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Enter workspace"
                    : mode === "register"
                      ? "Create workspace"
                      : mode === "forgot"
                        ? "Send reset OTP"
                        : "Reset password"}{" "}
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          {mode === "login" && (
            <button
              className="mx-auto mt-4 block border-0 bg-transparent font-['Geist'] text-[13px] font-semibold text-[#236b57]"
              onClick={() => {
                setMode("forgot");
                setError("");
                setNotice("");
              }}
            >
              Forgot password?
            </button>
          )}
          {mode !== "verify" && (
            <button
              className="mx-auto mt-[22px] block border-0 bg-transparent font-['Geist'] text-[13px] font-semibold text-[#236b57]"
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setError("");
                setNotice("");
              }}
            >
              {mode === "register"
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
