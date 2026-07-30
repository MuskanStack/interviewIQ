import { useState } from "react";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthModal({ onClose }) {
  const [isEmailFormVisible, setIsEmailFormVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  const clearFieldError = (field) => {
    if (!error) return;
    if (error.toLowerCase().includes(field) || error === "Something went wrong, please try again") {
      setError(null);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        {
          name: user.displayName,
          email: user.email,
        },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    clearFieldError("email");

    if (isExistingUser !== null) {
      setIsExistingUser(null);
      setPassword("");
      setName("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    clearFieldError("password");
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    clearFieldError("name");
  };

  const handleEmailContinue = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await axios.post(
        `${ServerUrl}/api/auth/check-email`,
        { email: trimmedEmail },
        { withCredentials: true }
      );
      setIsExistingUser(result.data.exists);
    } catch (err) {
      console.error(err);
      setError("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (isExistingUser === false && !trimmedName) {
      setError("Name is required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const endpoint = isExistingUser ? "/api/auth/login" : "/api/auth/signup";
      const body = isExistingUser
        ? { email: trimmedEmail, password }
        : { name: trimmedName, email: trimmedEmail, password };

      const result = await axios.post(`${ServerUrl}${endpoint}`, body, {
        withCredentials: true,
      });

      dispatch(setUserData(result.data));
      onClose();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message;
      setError(message || "Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = isExistingUser === null ? "Continue" : isExistingUser ? "Log In" : "Sign Up";
  const headerText = isExistingUser === null ? "Continue with email" : isExistingUser ? "Welcome back" : "Create your account";

  const getFieldError = (field) => {
    if (!error) return null;
    const normalized = error.toLowerCase();

    if (field === "email" && normalized.includes("email")) return error;
    if (field === "password" && normalized.includes("password")) return error;
    if (field === "name" && normalized.includes("name")) return error;
    return null;
  };

  const isTopError = error && !/(email|password|name)/i.test(error);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/25 backdrop-blur-sm px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white shadow-2xl"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">InterviewIQ</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Sign in or create an account</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              ×
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            <FcGoogle size={20} />
            {loading ? "Loading..." : "Continue with Google"}
          </button>

          <div className="my-6 flex items-center gap-3 text-sm text-gray-500">
            <span className="h-px flex-1 bg-gray-200" />
            <button
              type="button"
              onClick={() => {
                setIsEmailFormVisible(true);
                setError(null);
              }}
              className="font-semibold text-black hover:underline"
            >
              or continue with email
            </button>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {isEmailFormVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="mb-4 text-base font-semibold text-gray-900">{headerText}</p>

              {isTopError && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                  {getFieldError("email") && (
                    <p className="mt-2 text-red-500 text-sm">{getFieldError("email")}</p>
                  )}
                </div>

                {isExistingUser !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {isExistingUser === false && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={handleNameChange}
                          className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                          placeholder="Your full name"
                          disabled={loading}
                        />
                        {getFieldError("name") && (
                          <p className="mt-2 text-red-500 text-sm">{getFieldError("name")}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                        placeholder="At least 8 characters"
                        disabled={loading}
                      />
                      {getFieldError("password") && (
                        <p className="mt-2 text-red-500 text-sm">{getFieldError("password")}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                type="button"
                onClick={isExistingUser === null ? handleEmailContinue : handleSubmit}
                disabled={loading}
                className="mt-6 w-full rounded-3xl bg-black px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                {loading ? "Loading..." : buttonLabel}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AuthModal;
