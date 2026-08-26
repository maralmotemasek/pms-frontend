import "./Header.css";

function Header() {
  return (
    <header className="main-header">

      <div className="header-user">

        <div className="user-info">
          <strong>علیرضا نوری</strong>
          <span>مدیر پروژه ارشد</span>
        </div>

        <div className="user-avatar">
          👤
        </div>

        <div className="header-divider" />

        <button
          type="button"
          className="notification-button"
        >
          🔔
        </button>

      </div>


      <div className="header-search">
        <input
          type="text"
          placeholder="جستجو در پروژه‌ها، وظایف و اعضا..."
        />
      </div>


      <h1 className="header-title">
        مدیریت پروژه‌های سازمان
      </h1>

    </header>
  );
}

export default Header;