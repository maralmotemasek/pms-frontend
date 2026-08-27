import "./AuthCard.css";

function AuthCard({ children, className = "" }) {
  return (
    <div className={`auth-card ${className}`}>
      {children}
    </div>
  );
}

export default AuthCard;