import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

import "./AppLayout.css";


function AppLayout() {
  return (
    <div className="app-layout">

      <Sidebar />

      <div className="app-main">

        <Header />

        <main className="app-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}


export default AppLayout;