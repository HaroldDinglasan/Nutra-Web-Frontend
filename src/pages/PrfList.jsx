import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/DashboardAdmin.css";
import NutraTechLogo from "../assets/NTBI.png";
import userLogout from "../assets/user-signout.png";

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("entry"); // "entry" or "list"
  const [prfList, setPrfList] = useState([]); // State to store PRF data

  useEffect(() => {
    fetchPrfList();
  }, []);

  const fetchPrfList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/prf-list");
      setPrfList(response.data);
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="nutra-container">
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div className="logo-container">
            <img src={NutraTechLogo || "/placeholder.svg"} alt="NutraTech Biopharma, Inc." className="company-logo" />
          </div>
          <div className="welcome-text">Welcome Admin</div>
          <div className="user-dashboard-container">
            <img src={userLogout || "/placeholder.svg"} alt="User Logo" onClick={toggleDropdown} className="user-dashboard-icon" />
            {dropdownOpen && (
              <div className="dropdown-menu-dashboard">
                <div className="user-info-dashboard">
                  <img src={userLogout || "/placeholder.svg"} alt="User Signout" className="dashboard-signout-icon" />
                  <p className="dropdown-user-dashboard-label">Admin</p>
                </div>
                <button className="signout-dashboard-button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="dashboard-content">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div 
              className={`sidebar-item ${activeSection === "entry" ? "active" : ""}`} 
              onClick={() => setActiveSection("entry")}
            >
              <span className="dashboard-label">Purchase Entry</span>
            </div>

            <div 
              className={`sidebar-item ${activeSection === "list" ? "active" : ""}`} 
              onClick={() => setActiveSection("list")}
            >
              <span className="dashboard-label">Purchase List</span>
            </div>
          </aside>

          {/* Main content */}
          <main className="dashboard-main">
            {activeSection === "entry" ? (
              <div className="welcome-container">
                <h2>Welcome to NutraTech Biopharma Inc.</h2>
                <p>Please proceed with your purchase list.</p>
              </div>
            ) : (
              <div className="log-table-container">
                <table className="log-table">
                  <thead>
                    <tr>
                      <th>Prf No.</th>
                      <th>Prepared By</th>
                      <th>Date</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prfList.length > 0 ? (
                      prfList.map((prf, index) => (
                        <tr key={index}>
                          <td>No. {prf.prfNo}</td>
                          <td>{prf.preparedBy}</td>
                          <td>{new Date(prf.prfDate).toLocaleString()}</td>
                          <td>{prf.StockName || "No stock name available"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No PRF records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
