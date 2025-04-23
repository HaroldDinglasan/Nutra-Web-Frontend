"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import NutraTechLogo from "../assets/NTBI.png"
import userLogout from "../assets/user-signout.png"
import downloadLogo from "../assets/downloads.png"
import printLogo from "../assets/printing.png"
import search from "../assets/search.png"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "../styles/DashboardAdmin.css"

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [searchInput, setSearchInput] = useState("")

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

  // Print Function
  const handlePrint = () => {
    window.print()
  }

  // Download PDF function
  const handleDownloadPDF = () => {
    const saveButton = document.querySelector(".save-button-container")
    if (saveButton) saveButton.style.display = "none" // Hide button

    const input = document.querySelector(".form-box-container")
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save("Purchase_Request_Form.pdf")

      if (saveButton) saveButton.style.display = "flex" // Show button again
    })
  }

  // Search PRF function
  const handleSearchPrf = async () => {
    if (!searchInput.trim()) {
      alert("Please enter a PRF number to search")
      return
    }

    // Remove "No. " prefix if it exists
    let searchValue = searchInput.trim()
    if (searchValue.startsWith("No. ")) {
      searchValue = searchValue.substring(4)
    }

    console.log(`Searching for PRF number: ${searchValue}`)

    try {
      const response = await fetch(`http://localhost:5000/api/search-prf?prfNo=${searchValue}`)
      const data = await response.json()

      if (response.ok && data.found) {
        console.log("PRF found:", data)

        // Store the search results in sessionStorage to pass to NutraTechForm
        sessionStorage.setItem("prfSearchResults", JSON.stringify(data))

        // Navigate to the form page if not already there
        if (location.pathname !== "/nutratech/form") {
          const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc"
          navigate("/nutratech/form", { state: { company } })
        } else {
          // If already on the form page, trigger a refresh
          window.dispatchEvent(new CustomEvent("prfSearchCompleted"))
        }

        alert("PRF details loaded successfully!")
      } else {
        alert("PRF not found. Please check the PRF number and try again.")
      }
    } catch (error) {
      console.error("Error searching PRF:", error)
      alert("Failed to search PRF. Please try again later.")
    }
  }

  const fullname = localStorage.getItem("userFullname") || "User"

  return (
    <div className="nutra-container">
      <div className="admin-dashboard">
        <header className="dashboard-header nav-bar-container">
          <div className="header-content">
            <div className="logo-container">
              <img src={NutraTechLogo || "/placeholder.svg"} alt="NutraTech Biopharma, Inc." className="company-logo" />
            </div>

            <div
              className="search-container"
              style={{ visibility: activeSection === "prfRequest" ? "visible" : "hidden", display: "flex" }}
            >
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search"
                  className="search-input-form"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button className="search-button" onClick={handleSearchPrf}>
                  <img className="searchPrfNo" src={search || "/placeholder.svg"} alt="Search" />
                </button>
              </div>
            </div>

            <div
              className="nav-icons"
              style={{ visibility: activeSection === "prfRequest" ? "visible" : "hidden", display: "flex" }}
            >
              <img
                src={printLogo || "/placeholder.svg"}
                alt="Print Logo"
                onClick={handlePrint}
                className="print-icon"
              />
              <img
                src={downloadLogo || "/placeholder.svg"}
                alt="Download Logo"
                onClick={handleDownloadPDF}
                className="download-icon"
              />
            </div>

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
          </div>
        </header>

        <div className="dashboard-content">
          <aside className="dashboard-sidebar sidebar-container">
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
