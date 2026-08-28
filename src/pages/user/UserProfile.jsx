import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AtSign,
  CircleUserRound,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "./UserProfile.css";


function getStatusLabel(status) {
  if (
    status === null ||
    status === undefined ||
    status === ""
  ) {
    return "نامشخص";
  }


  if (
    status === true ||
    String(status).toLowerCase() === "true" ||
    String(status).toLowerCase() === "active"
  ) {
    return "فعال";
  }


  if (
    status === false ||
    String(status).toLowerCase() === "false" ||
    String(status).toLowerCase() === "inactive"
  ) {
    return "غیرفعال";
  }


  if (
    String(status).toLowerCase() === "blocked"
  ) {
    return "مسدود";
  }


  return String(status);
}


function UserProfile() {
  const navigate =
    useNavigate();


  const [
    user,
    setUser,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const getUserProfile =
    async () => {

      setLoading(true);
      setError("");


      try {
        const accessToken =
          localStorage.getItem(
            "access_token"
          );


        if (!accessToken) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }


        const response =
          await fetch(
            "http://localhost:3001/auth/me",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,

                Accept:
                  "application/json",
              },
            }
          );


        if (
          response.status === 401
        ) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );


          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }


        if (!response.ok) {
          throw new Error(
            "دریافت اطلاعات کاربر با خطا مواجه شد."
          );
        }


        const data =
          await response.json();


        setUser(data);
      } catch (requestError) {
        console.error(
          "Get user profile error:",
          requestError
        );


        setError(
          "دریافت اطلاعات حساب کاربری امکان‌پذیر نیست. مطمئن شوید Backend اجرا شده است."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    getUserProfile();
  }, []);


  if (loading) {
    return (
      <section className="user-profile-page">

        <div className="user-profile-loading">

          <RefreshCw
            size={25}
            className="user-profile-spinner"
          />

          <span>
            در حال دریافت اطلاعات کاربر...
          </span>

        </div>

      </section>
    );
  }


  if (error) {
    return (
      <section className="user-profile-page">

        <div className="user-profile-error-card">

          <CircleUserRound
            size={42}
          />


          <h2>
            اطلاعات حساب دریافت نشد
          </h2>


          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={
              getUserProfile
            }
          >

            <RefreshCw
              size={17}
            />

            تلاش مجدد

          </button>

        </div>

      </section>
    );
  }


  return (
    <section className="user-profile-page">

      {/* =====================
          HEADER
      ====================== */}

      <div className="user-profile-header">

        <div>

          <h2>
            پروفایل کاربری
          </h2>


          <p>
            اطلاعات حساب کاربری شما
          </p>

        </div>

      </div>


      {/* =====================
          PROFILE CARD
      ====================== */}

      <div className="user-profile-card">

        <div className="user-profile-summary">

          <div className="user-profile-avatar">

            <UserRound
              size={37}
            />

          </div>


          <div className="user-profile-main-info">

            <h3>
              {user?.full_name ||
                "کاربر"}
            </h3>


            <span>
              {user?.username ||
                "نام کاربری"}
            </span>

          </div>


          <div
            className={`user-profile-status status-${String(
              user?.status ??
                "unknown"
            ).toLowerCase()}`}
          >

            <ShieldCheck
              size={15}
            />

            {getStatusLabel(
              user?.status
            )}

          </div>

        </div>


        {/* =====================
            USER INFO
        ====================== */}

        <div className="user-profile-info-grid">

          {/* FULL NAME */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <UserRound
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                نام و نام خانوادگی
              </span>


              <strong>
                {user?.full_name ||
                  "ثبت نشده"}
              </strong>

            </div>

          </div>


          {/* USERNAME */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <AtSign
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                نام کاربری
              </span>


              <strong>
                {user?.username ||
                  "ثبت نشده"}
              </strong>

            </div>

          </div>


          {/* EMAIL */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <Mail
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                ایمیل
              </span>


              <strong className="english-value">
                {user?.email ||
                  "ثبت نشده"}
              </strong>

            </div>

          </div>


          {/* PHONE */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <Phone
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                شماره موبایل
              </span>


              <strong className="english-value">
                {user?.phone ||
                  "ثبت نشده"}
              </strong>

            </div>

          </div>


          {/* STATUS */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <ShieldCheck
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                وضعیت حساب
              </span>


              <strong>
                {getStatusLabel(
                  user?.status
                )}
              </strong>

            </div>

          </div>


          {/* USER ID */}

          <div className="user-info-item">

            <div className="user-info-icon">

              <CircleUserRound
                size={19}
              />

            </div>


            <div className="user-info-content">

              <span>
                شناسه کاربر
              </span>


              <strong>
                {user?.id ??
                  "نامشخص"}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================
          NOTE
      ====================== */}

      <div className="user-profile-note">

        <ShieldCheck
          size={18}
        />


        <p>
          اطلاعات این صفحه از حساب کاربری
          لاگین‌شده دریافت می‌شود. اطلاعات
          Organization و Role بعداً پس از
          آماده شدن APIهای مربوط به سازمان
          به این بخش اضافه می‌شوند.
        </p>

      </div>

    </section>
  );
}


export default UserProfile;