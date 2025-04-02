import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardAdmin.css";
import NutraTechLogo from "../assets/NTBI.png";
import userLogout from "../assets/user-signout.png";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  };

  const fullname = "Admin"; //Replace with Actual user data

  const handleSignOut = () => {
    // Clear any session storage or authentication data
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  // Sample log data
  const logData = [
    { id: "N 12345", user: "John Lloyd Garcia", date: "3/28/2025 10:30 am", activity: "User create request" },
    { id: "A 12345", user: "Renzon Tolentino", date: "3/28/2025 10:30 am", activity: "User create request" },
    { id: "B 12345", user: "Harold Ian Dave B. Dinglasan", date: "3/28/2025 10:30 am", activity: "User create request" },
  ];

  return (
    <div className="nutra-container">
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div className="logo-container">
            <img src={NutraTechLogo || "/placeholder.svg"} alt="NutraTech Biopharma, Inc." className="company-logo" />
          </div>
          <div className="welcome-text">Welcome {fullname}</div>

          <div className="user-dashboard-container">
            <img
              src={userLogout || "/placeholder.svg"}
              alt="User Logo"
              onClick={toggleDropdown}
              className="user-dashboard-icon"
            />
            {dropdownOpen && (
              <div className="dropdown-menu-dashboard">
                <div className="user-info-dashboard">
                  <img
                    src={userLogout || "/placeholder.svg"}
                    alt="User Signout"
                    className="dashboard-signout-icon"
                  />
                  <p className="dropdown-user-dashboard-label">{fullname}</p>
                </div>
                <button className="signout-dashboard-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>


        </header>

        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <div className="sidebar-item active">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                color="black"
              >
                <rect x="3" y="3" width="7" height="9"></rect>
                <rect x="14" y="3" width="7" height="5"></rect>
                <rect x="14" y="12" width="7" height="9"></rect>
                <rect x="3" y="16" width="7" height="5"></rect>
              </svg>
              <span className="dashboard-label">Dashboard</span>
            </div>
          </aside>

          <main className="dashboard-main">

            <div className="log-table-container">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Prf No.</th>
                    <th>User Information</th>
                    <th>Date</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {logData.map((log) => (
                    <tr key={log.id}>
                      <td>No. {log.id}</td>
                      <td>{log.user}</td>
                      <td>{log.date}</td>
                      <td>{log.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
