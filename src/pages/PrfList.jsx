"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/DashboardAdmin.css"
import NutraTechLogo from "../assets/NTBI.png"
import userLogout from "../assets/user-signout.png"

const DashboardAdmin = () => {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("entry") // Entry or list
  const [prfList, setPrfList] = useState([]) // Store PRF data
  const [filteredPrfList, setFilteredPrfList] = useState([]) // Store filtered PRF data
  const [searchTerm, setSearchTerm] = useState("") // Store search term

  useEffect(() => {
    fetchPrfList()
  }, [])

  // Effect to filter the PRF list
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, show all PRFs
      setFilteredPrfList(prfList)
      return
    }

    // Convert search term to lowercase
    let term = searchTerm.toLowerCase()

    // Remove "No. " prefix from search term if it exists
    if (term.startsWith("no. ")) {
      term = term.substring(4)
    }

    // Filter the PRF list
    const filtered = prfList.filter((prf) => {
      // Get prfNo as string and convert to lowercase
      const prfNoStr = prf.prfNo ? prf.prfNo.toString().toLowerCase() : ""

    
      return (
        // Search in PRF number
        prfNoStr.includes(term) ||
        // Search in prepared by
        (prf.preparedBy && prf.preparedBy.toLowerCase().includes(term)) ||
        // Search in date
        (prf.dateNeeded && formatDate(prf.dateNeeded).toLowerCase().includes(term)) ||
        // Search in description
        (prf.StockName && prf.StockName.toLowerCase().includes(term))
      )
    })

    setFilteredPrfList(filtered)
  }, [searchTerm, prfList])

  const fetchPrfList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/prf-list")
      setPrfList(response.data)
      setFilteredPrfList(response.data) // Filtered list with all data
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSignOut = () => {
    sessionStorage.clear()
    localStorage.clear()
    navigate("/login")
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    // Try to parse as date
    const date = new Date(dateString)

    // Check if it's a valid date
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString()
    }
    
    return dateString
  }

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Check if a row is canceled
  const isRowCanceled = (prf) => {
    // Check if header or details are marked as canceled
    return prf.prfIsCancel === true || prf.detailsIsCancel === true
  }

  return (
    <div className="nutra-container">
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div className="logo-container">
            <img src={NutraTechLogo || "/placeholder.svg"} alt="NutraTech Biopharma, Inc." className="company-logo" />
          </div>
          <div className="welcome-text">Welcome Admin</div>
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

          <main className="dashboard-main">
            {activeSection === "entry" ? (
              <div className="welcome-container">
                <h2>Welcome to NutraTech Biopharma Inc</h2>
              </div>
            ) : (
              <div className="log-table-container">
               
                <div className="search-prf-container">
                  <div className="search-prf-wrapper">
                    <svg
                      className="search-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by PRF No..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="search-input"
                    />
                    {searchTerm && (
                      <button className="clear-search" onClick={clearSearch}>
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
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <table className="log-table">
                  <thead>
                    <tr>
                      <th>Prf No.</th>
                      <th>Prepared By</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrfList.length > 0 ? (
                      filteredPrfList.map((prf, index) => (
                        <tr key={index} className={isRowCanceled(prf) ? "canceled-row" : ""}>
                          <td>No. {prf.prfNo}</td>
                          <td>{prf.preparedBy}</td>
                          <td>{formatDate(prf.dateNeeded)}</td>
                          <td>{prf.StockName || "No stock name available"}</td>
                          <td>{prf.quantity || "N/A"}</td>
                          <td>{prf.unit || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No matching PRF records found.</td>
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
  )
}

export default DashboardAdmin
