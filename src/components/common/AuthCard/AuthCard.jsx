import "./AuthCard.css";

function AuthCard({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}

export default AuthCard;