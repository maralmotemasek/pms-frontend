import "./AuthHeader.css";


function AuthHeader({
  title = "سیستم مدیریت پروژه",
  subtitle = "ورود به پنل مدیریت سازمانی"
}) {

  return (
    <div className="auth-header">

      <div className="logo-placeholder">
        ◇
      </div>

      <h1>
        {title}
      </h1>

      <p>
        {subtitle}
      </p>

    </div>
  );
}


export default AuthHeader;