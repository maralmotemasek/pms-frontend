import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  UserRound,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../../services/authService";

import "./Header.css";


function Header() {
  const navigate = useNavigate();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);


  useEffect(() => {
    const loadCurrentUser =
      async () => {

        const accessToken =
          localStorage.getItem(
            "access_token"
          );

        if (!accessToken) {
          setLoadingUser(false);

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        try {
          const data =
            await getCurrentUser();

          setUser(data);
        } catch (error) {
          console.error(
            "Header user error:",
            error
          );

          /*
            اگر Refresh Token هم نامعتبر باشد،
            api.js توکن‌ها را پاک می‌کند
            و کاربر را به Login می‌فرستد.
          */
        } finally {
          setLoadingUser(false);
        }
      };


    loadCurrentUser();
  }, [navigate]);


  const displayName =
    user?.full_name ||
    user?.username ||
    "کاربر";


  const displayUsername =
    user?.username ||
    user?.email ||
    "حساب کاربری";


  const handleProfileClick = () => {
    navigate("/profile");
  };


  return (
    <header className="main-header">

      {/* USER SECTION */}

      <div className="header-user">

        <button
          type="button"
          className="header-profile-button"
          onClick={handleProfileClick}
          aria-label="مشاهده پروفایل کاربری"
        >

          <div className="user-avatar">

            <UserRound
              size={20}
              strokeWidth={1.9}
            />

          </div>


          <div className="user-info">

            <strong>
              {loadingUser
                ? "در حال بارگذاری..."
                : displayName}
            </strong>


            <span>
              {loadingUser
                ? "حساب کاربری"
                : displayUsername}
            </span>

          </div>

        </button>


        <div
          className="header-divider"
        />


        <button
          type="button"
          className="notification-button"
          aria-label="اعلان‌ها"
        >

          <Bell
            size={18}
            strokeWidth={1.8}
          />

        </button>

      </div>


      {/* SEARCH */}

      <div className="header-search">

        <input
          type="text"
          placeholder="جستجو در پروژه‌ها، وظایف و اعضا..."
        />

      </div>


      {/* TITLE */}

      <h1 className="header-title">
        مدیریت پروژه‌های سازمان
      </h1>

    </header>
  );
}


export default Header;
