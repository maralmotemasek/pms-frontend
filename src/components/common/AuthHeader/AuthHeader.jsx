import "./AuthHeader.css";

function AuthHeader({
  title = "سیستم مدیریت پروژه",
  subtitle = "ورود به پنل مدیریت سازمانی",
}) {
  return (
    <div className="auth-header">
      <div className="auth-logo">
        <span className="auth-logo-shape" />
      </div>

      <h1 className="auth-title">
        {title}
      </h1>

      <p className="auth-subtitle">
        {subtitle}
      </p>
    </div>
  );
}

export default AuthHeader;