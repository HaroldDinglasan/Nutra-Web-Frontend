"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import NutraTechLogo from "../assets/NTBI.png"
import userLogout from "../assets/user-signout.png"
import "../styles/DashboardAdmin.css"

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  // Set active section based on current path
  useEffect(() => {
    if (location.pathname === "/prf/list") {
      if (location.hash === "#dashboard") {
        setActiveSection("entry")
      } else {
        setActiveSection("list")
      }
    } else if (location.pathname === "/nutratech/form") {
      setActiveSection("prfRequest")
    }
  }, [location])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSignOut = () => {
    sessionStorage.clear()
    localStorage.clear()
    navigate("/login")
  }

  // Navigation functions
  const navigateToDashboard = () => {
    setActiveSection("entry")
    navigate("/prf/list#dashboard")
  }

  const navigateToPurchaseList = () => {
    setActiveSection("list")
    navigate("/prf/list")
  }

  const navigateToPrfRequest = () => {
    setActiveSection("prfRequest")
    const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc"
    navigate("/nutratech/form", { state: { company } })
  }

  // Get user fullname from localStorage
  const fullname = localStorage.getItem("userFullname") || "User"

  return (
    <div className="nutra-container">
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div className="logo-container">
            <img src={NutraTechLogo || "/placeholder.svg"} alt="NutraTech Biopharma, Inc." className="company-logo" />
          </div>
          <div className="welcome-text"></div>
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
                  <img src={userLogout || "/placeholder.svg"} alt="User Signout" className="dashboard-signout-icon" />
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
            <div className={`sidebar-item ${activeSection === "entry" ? "active" : ""}`} onClick={navigateToDashboard}>
              <div className="sidebar-indicator"></div>
              <span className="dashboard-label">Dashboard</span>
            </div>

            <div
              className={`sidebar-item ${activeSection === "list" ? "active" : ""}`}
              onClick={navigateToPurchaseList}
            >
              <div className="sidebar-indicator"></div>
              <span className="dashboard-label">Purchase List</span>
            </div>

            <div
              className={`sidebar-item ${activeSection === "prfRequest" ? "active" : ""}`}
              onClick={navigateToPrfRequest}
            >
              <div className="sidebar-indicator"></div>
              <span className="dashboard-label">PRF Request</span>
            </div>
          </aside>

          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout