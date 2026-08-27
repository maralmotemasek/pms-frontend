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
  registerUser,
} from "../../../services/authService";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await registerUser({
        full_name:
          data.full_name.trim(),

        username:
          data.username.trim(),

        phone:
          data.phone.trim(),

        email:
          data.email.trim(),

        password:
          data.password,
      });

      setSuccessMessage(
        "ثبت نام با موفقیت انجام شد."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      const status =
        error.response?.status;

      const detail =
        error.response?.data?.detail;

      if (status === 422) {
        setServerError(
          "اطلاعات وارد شده معتبر نیست. لطفاً فیلدها را بررسی کنید."
        );
      } else if (
        status === 400 ||
        status === 409
      ) {
        setServerError(
          typeof detail === "string"
            ? detail
            : "این ایمیل یا نام کاربری قبلاً ثبت شده است."
        );
      } else if (!error.response) {
        setServerError(
          "ارتباط با سرور برقرار نشد."
        );
      } else {
        setServerError(
          typeof detail === "string"
            ? detail
            : "خطایی در ثبت نام رخ داد."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">

      <AuthCard className="register-card">

        <AuthHeader
          subtitle="ایجاد حساب کاربری جدید"
        />

        <form
          className="register-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >

          <div className="register-row">

            <div className="register-form-group">
              <label htmlFor="full_name">
                نام و نام خانوادگی
              </label>

              <input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="نام و نام خانوادگی"
                {...register("full_name", {
                  required:
                    "نام و نام خانوادگی الزامی است",

                  minLength: {
                    value: 3,
                    message:
                      "حداقل ۳ کاراکتر وارد کنید",
                  },
                })}
              />

              {errors.full_name && (
                <span className="register-field-error">
                  {errors.full_name.message}
                </span>
              )}
            </div>

            <div className="register-form-group">
              <label htmlFor="username">
                نام کاربری
              </label>

              <input
                id="username"
                type="text"
                dir="ltr"
                autoComplete="username"
                placeholder="username"
                {...register("username", {
                  required:
                    "نام کاربری الزامی است",

                  minLength: {
                    value: 3,
                    message:
                      "حداقل ۳ کاراکتر وارد کنید",
                  },
                })}
              />

              {errors.username && (
                <span className="register-field-error">
                  {errors.username.message}
                </span>
              )}
            </div>

          </div>

          <div className="register-row">

            <div className="register-form-group">
              <label htmlFor="phone">
                شماره موبایل
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                autoComplete="tel"
                placeholder="09123456789"
                {...register("phone", {
                  required:
                    "شماره موبایل الزامی است",

                  pattern: {
                    value:
                      /^09\d{9}$/,
                    message:
                      "شماره موبایل معتبر نیست",
                  },
                })}
              />

              {errors.phone && (
                <span className="register-field-error">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="register-form-group">
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
                <span className="register-field-error">
                  {errors.email.message}
                </span>
              )}
            </div>

          </div>

          <div className="register-form-group">
            <label htmlFor="password">
              رمز عبور
            </label>

            <div className="register-password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="new-password"
                placeholder="رمز عبور"
                {...register("password", {
                  required:
                    "رمز عبور الزامی است",

                  minLength: {
                    value: 6,
                    message:
                      "رمز عبور حداقل باید ۶ کاراکتر باشد",
                  },
                })}
              />

              <button
                type="button"
                className="register-password-toggle"
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
              <span className="register-field-error">
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && (
            <div className="register-server-error">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="register-success">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "در حال ثبت نام..."
              : "ثبت نام"}
          </button>

          <div className="register-login-link">
            <span>
              قبلاً ثبت نام کرده‌اید؟
            </span>

            <Link to="/login">
              ورود
            </Link>
          </div>

        </form>

      </AuthCard>

    </div>
  );
}

export default Register;