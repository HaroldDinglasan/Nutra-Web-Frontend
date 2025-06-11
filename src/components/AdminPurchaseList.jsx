"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminPurchaseList.css"

const AdminPurchaseList = ({ showDashboard = false }) => {
  const [prfList, setPrfList] = useState([])
  const [filteredPrfList, setFilteredPrfList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  // Get user fullname from localStorage
  const fullname = localStorage.getItem("userFullname") || "Admin"

  useEffect(() => {
    fetchAllPrfList()

    // Add event listener for PRF status updates
    const handlePrfStatusUpdate = () => {
      console.log("PRF status updated, refreshing admin data...")
      fetchAllPrfList()
    }

    window.addEventListener("prfStatusUpdated", handlePrfStatusUpdate)

    return () => {
      window.removeEventListener("prfStatusUpdated", handlePrfStatusUpdate)
    }
  }, [])

  // Function to determine PRF status
  const determinePrfStatus = (prf) => {
    // Check if cancelled first - check all possible cancel flags
    if (
      prf.prfIsCancel === 1 ||
      prf.prfIsCancel === true ||
      prf.detailsIsCancel === 1 ||
      prf.detailsIsCancel === true ||
      prf.isCancel === 1 ||
      prf.isCancel === true
    ) {
      return "Cancelled"
    }

    // Check if approved
    if (prf.approvedBy && prf.approvedBy.trim() !== "") {
      return "Approved"
    }

    // Default to Pending for newly created requests
    return "Pending"
  }

  // Function to fetch all PRF requests for admin
  const fetchAllPrfList = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("http://localhost:5000/api/prf-list")

      // Add status to each PRF record
      const prfListWithStatus = response.data.map((prf) => ({
        ...prf,
        status: determinePrfStatus(prf),
      }))

      setPrfList(prfListWithStatus)
      setFilteredPrfList(prfListWithStatus)
      setIsLoading(false)
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error)
      setIsLoading(false)
    }
  }

  // Calculate pending count
  const pendingCount = prfList.filter((prf) => prf.status === "Pending").length
  const approvedCount = prfList.filter((prf) => prf.status === "Approved").length
  const cancelledCount = prfList.filter((prf) => prf.status === "Cancelled").length

  // Effect to filter the PRF list based on search term and status
  useEffect(() => {
    if (!searchTerm.trim() && statusFilter === "all") {
      setFilteredPrfList(prfList)
      return
    }

    let term = searchTerm.toLowerCase()
    if (term.startsWith("no. ")) {
      term = term.substring(4)
    }

    const filtered = prfList.filter((prf) => {
      const prfNoStr = prf.prfNo ? prf.prfNo.toString().toLowerCase() : ""

      // Updated status filtering logic using the status property
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "cancelled" && prf.status === "Cancelled") ||
        (statusFilter === "pending" && prf.status === "Pending") ||
        (statusFilter === "approved" && prf.status === "Approved")

      if (!statusMatch) return false

      return (
        prfNoStr.includes(term) ||
        (prf.preparedBy && prf.preparedBy.toLowerCase().includes(term)) ||
        (prf.prfDate && formatDate(prf.prfDate).toLowerCase().includes(term)) ||
        (prf.StockName && prf.StockName.toLowerCase().includes(term))
      )
    })

    setFilteredPrfList(filtered)
  }, [searchTerm, statusFilter, prfList])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString()
    }
    return dateString
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "pending"
      case "Approved":
        return "approved"
      case "Cancelled":
        return "cancelled"
      default:
        return "pending"
    }
  }

  if (showDashboard) {
    return (
      <div className="admin-purchase-container">
        <div className="welcome-container">
          <h2>Welcome to Purchasing Admin Dashboard</h2>
        </div>

        <div className="dashboard-stats-container">
          <div className="stats-card pending-card">
            <div className="stats-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stats-content">
              <div className="stats-number">{isLoading ? "..." : pendingCount}</div>
              <div className="stats-label">Pending Requests</div>
              <div className="stats-description">Awaiting approval</div>
            </div>
          </div>

          <div className="stats-card approved-card">
            <div className="stats-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
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
            </div>
            <div className="stats-content">
              <div className="stats-number">{isLoading ? "..." : approvedCount}</div>
              <div className="stats-label">Approved Requests</div>
              <div className="stats-description">Successfully processed</div>
            </div>
          </div>

          {/* <div className="stats-card cancelled-card">
            <div className="stats-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="stats-content">
              <div className="stats-number">{isLoading ? "..." : cancelledCount}</div>
              <div className="stats-label">Cancelled Requests</div>
              <div className="stats-description">Rejected or cancelled</div>
            </div>
          </div> */}
        </div>

        {/* <div className="dashboard-summary">
          <h3>Quick Summary</h3>
          <p>
            Total PRF Requests: <strong>{prfList.length}</strong>
          </p>
          <p>
            Last Updated: <strong>{new Date().toLocaleDateString()}</strong>
          </p>
        </div> */}
      </div>
    )
  }

  return (
    <div className="admin-purchase-container">
      <div className="welcome-container">
        <h2>Welcome to Purchasing Admin Dashboard</h2>
      </div>

      <div className="admin-controls">
        <div className="search-container">
          <div className="search-box-list">
            <input
              type="text"
              placeholder="Search"
              className="search-input-form"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-button" onClick={() => handleSearchChange({ target: { value: searchTerm } })}>
              <svg
                className="searchPrfNo"
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
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            {searchTerm && (
              <button className="clear-search" onClick={clearSearch}>
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="filter-container">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading purchase requests...</p>
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
                <th>Quantity</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrfList.length > 0 ? (
                filteredPrfList.map((prf, index) => {
                  const isCancelled = prf.status === "Cancelled"
                  return (
                    <tr key={index} className={isCancelled ? "canceled-row" : ""}>
                      <td style={{ color: isCancelled ? "red" : "inherit" }}>No. {prf.prfNo}</td>
                      <td>{prf.preparedBy}</td>
                      <td>{formatDate(prf.prfDate)}</td>
                      <td>{prf.StockName || "No stock name available"}</td>
                      <td>{prf.quantity || "N/A"}</td>
                      <td>{prf.unit || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${prf.status.toLowerCase()}`}>{prf.status}</span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No matching PRF records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPurchaseList
