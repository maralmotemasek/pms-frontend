import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
} from "lucide-react";

import AuthCard from "../../../components/common/AuthCard/AuthCard";
import AuthHeader from "../../../components/common/AuthHeader/AuthHeader";

import {
  loginUser,
} from "../../../services/authService";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      await loginUser({
        email: data.email.trim(),
        password: data.password,
      });

      navigate("/projects");
    } catch (error) {
      console.error("Login error:", error);

      const status =
        error.response?.status;

      const detail =
        error.response?.data?.detail;

      if (
        status === 400 ||
        status === 401
      ) {
        setServerError(
          typeof detail === "string"
            ? detail
            : "ایمیل یا رمز عبور صحیح نیست."
        );
      } else if (status === 422) {
        setServerError(
          "اطلاعات وارد شده معتبر نیست."
        );
      } else if (!error.response) {
        setServerError(
          "ارتباط با سرور برقرار نشد."
        );
      } else {
        setServerError(
          "خطایی در ورود به حساب کاربری رخ داد."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AuthCard className="login-card">

        <AuthHeader
          subtitle="ورود به پنل مدیریت سازمانی"
        />

        <form
          className="login-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >

          <div className="login-form-group">
            <label htmlFor="email">
              ایمیل
            </label>

            <input
              id="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="example@email.com"
              {...register("email", {
                required:
                  "ایمیل الزامی است",

                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message:
                    "فرمت ایمیل صحیح نیست",
                },
              })}
            />

            {errors.email && (
              <span className="login-field-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="login-form-group">
            <label htmlFor="password">
              رمز عبور
            </label>

            <div className="login-password-wrapper">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="رمز عبور خود را وارد کنید"
                {...register("password", {
                  required:
                    "رمز عبور الزامی است",
                })}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label="نمایش یا مخفی کردن رمز عبور"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errors.password && (
              <span className="login-field-error">
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && (
            <div className="login-server-error">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "در حال ورود..."
              : "ورود"}
          </button>

          <button
            type="button"
            className="login-forgot-password"
          >
            رمز عبور خود را فراموش کرده‌اید؟
          </button>

          <div className="login-register-link">
            <span>
              هنوز ثبت نام نکرده‌اید؟
            </span>

            <Link to="/register">
              ثبت نام
            </Link>
          </div>

        </form>
      </AuthCard>
    </div>
  );
}

export default Login;