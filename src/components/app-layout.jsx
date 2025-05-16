"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import NutraTechLogo from "../assets/NTBI.png"
import downloadLogo from "../assets/downloads.png"
import printLogo from "../assets/printing.png"
import search from "../assets/search.png"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "../styles/app-layout.css"
import { SaveButton, UpdateButton } from "../components/button"
import ApprovalModal from "./ApprovalModal"

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPrfCancelled, setIsPrfCancelled] = useState(false)
  const [cancelLimitReached, setCancelLimitReached] = useState(false)

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

  // clear search input when changing side bar label
  useEffect(() => {
    setSearchInput("")
  }, [activeSection])

  useEffect(() => {
    const handleFormStateChange = (event) => {
      if (event.detail) {
        setIsUpdating(event.detail.isUpdating)
        setIsPrfCancelled(event.detail.isPrfCancelled)
        setCancelLimitReached(event.detail.cancelLimitReached)
      }
    }

    window.addEventListener("prfFormStateChanged", handleFormStateChange)
    return () => {
      window.removeEventListener("prfFormStateChanged", handleFormStateChange)
    }
  }, [])

  // close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".settings-icon-wrapper") && !event.target.closest(".settings-dropdown-menu")) {
        setSettingsDropdownOpen(false)
      }
      if (!event.target.closest(".user-profile") && !event.target.closest(".dropdown-menu-dashboard")) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const toggleSettingsDropdown = () => {
    setSettingsDropdownOpen(!settingsDropdownOpen)
  }

  const openApprovalModal = () => {
    setSettingsDropdownOpen(false)
    setApprovalModalOpen(true)
  }

  const closeApprovalModal = () => {
    setApprovalModalOpen(false)
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

  // Create a new PRF form
  const handleNewPrf = () => {
    // Clear existing search results
    sessionStorage.removeItem("prfSearchResults")

    // Clear search input
    setSearchInput("")

    // Clear approval names from localStorage for new form
    localStorage.removeItem("checkedByUser")
    localStorage.removeItem("approvedByUser")
    localStorage.removeItem("receivedByUser")

    // Navigate to the form page with a fresh state
    const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc"
    navigate("/nutraTech/form", {
      state: {
        company,
        isNew: true,
      },
    })

    // Dispatch event to reset the form
    window.dispatchEvent(new CustomEvent("prfNewForm"))

    // Also dispatch an event to clear approval names
    window.dispatchEvent(
      new CustomEvent("approvalSettingsUpdated", {
        detail: {
          checkedByUser: "",
          approvedByUser: "",
          receivedByUser: "",
        },
      }),
    )
  }

  // search PRF function
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

        // store the prf search results in sessionStorage to pass to NutraTechForm
        sessionStorage.setItem("prfSearchResults", JSON.stringify(data))

        // navigate to the form page if not already there
        if (location.pathname !== "/nutratech/form") {
          const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc"
          navigate("/nutratech/form", { state: { company } })
        } else {
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
                  placeholder="Search PRF No."
                  className="search-input-form"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button className="search-button" onClick={handleSearchPrf}>
                  <img className="searchPrfNo" src={search || "/placeholder.svg"} alt="Search" />
                </button>
              </div>
            </div>

            <div className="buttons-container">
              {activeSection === "prfRequest" && (
                <>
                  <button className="new-button" onClick={handleNewPrf}>
                    <span className="button-icon">+</span>
                    <span>New PRF</span>
                  </button>
                </>
              )}
            </div>

            {activeSection === "prfRequest" && (
              <div className="save-update-button">
                {isUpdating ? (
                  <UpdateButton
                    onClick={() => window.dispatchEvent(new CustomEvent("prfUpdateClicked"))}
                    disabled={isPrfCancelled || cancelLimitReached}
                  />
                ) : (
                  <SaveButton onClick={() => window.dispatchEvent(new CustomEvent("prfSaveClicked"))} />
                )}
              </div>
            )}

            <div
              className="nav-icons"
              style={{ visibility: activeSection === "prfRequest" ? "visible" : "hidden", display: "flex" }}
            >
              <div className="icon-wrapper" onClick={handlePrint} title="Print">
                <img src={printLogo || "/placeholder.svg"} alt="Print" className="action-icon" />
              </div>
              <div className="icon-wrapper" onClick={handleDownloadPDF} title="Download PDF">
                <img src={downloadLogo || "/placeholder.svg"} alt="Download" className="action-icon" />
              </div>

              <div className="settings-icon-wrapper" onClick={toggleSettingsDropdown} title="Settings">
                <div className="settings-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="settings-svg"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                {settingsDropdownOpen && (
                  <div className="settings-dropdown-menu">
                    <button className="settings-dropdown-item" onClick={openApprovalModal}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span>Approval Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="user-dashboard-container">
              <div className="user-profile" onClick={toggleDropdown}>
                <span className="user-initial">{fullname.charAt(0)}</span>
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu-dashboard">
                  <div className="user-info-dashboard">
                    <div className="user-avatar">
                      <span>{fullname.charAt(0)}</span>
                    </div>
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
            <div className="sidebar-header">
              <h3>Menu</h3>
            </div>
            <div className={`sidebar-item ${activeSection === "entry" ? "active" : ""}`} onClick={navigateToDashboard}>
              <div className="sidebar-indicator"></div>
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </div>
              <span className="dashboard-label">Dashboard</span>
            </div>

            <div
              className={`sidebar-item ${activeSection === "list" ? "active" : ""}`}
              onClick={navigateToPurchaseList}
            >
              <div className="sidebar-indicator"></div>
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
              <span className="dashboard-label">Purchase List</span>
            </div>

            <div
              className={`sidebar-item ${activeSection === "prfRequest" ? "active" : ""}`}
              onClick={navigateToPrfRequest}
            >
              <div className="sidebar-indicator"></div>
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className="dashboard-label">PRF Request</span>
            </div>
          </aside>

          <main className="dashboard-main">
            <div className="page-titles">
              {activeSection === "entry"}
              {activeSection === "list"}
              {activeSection === "prfRequest"}
            </div>
            <div className="main-content">{children}</div>
          </main>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModalOpen && <ApprovalModal onClose={closeApprovalModal} />}
    </div>
  )
}

export default AppLayout
