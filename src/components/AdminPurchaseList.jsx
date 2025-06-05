"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/AdminPurchaseList.css"

const AdminPurchaseList = () => {
  const [prfList, setPrfList] = useState([])
  const [filteredPrfList, setFilteredPrfList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  // Get user fullname from localStorage
  const fullname = localStorage.getItem("userFullname") || "Admin"

  useEffect(() => {
    fetchAllPrfList()
  }, [])

  // Function to fetch all PRF requests for admin
  const fetchAllPrfList = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("http://localhost:5000/api/prf-list")
      setPrfList(response.data)
      setFilteredPrfList(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error)
      setIsLoading(false)
    }
  }

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

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "cancelled" && (prf.prfIsCancel === 1 || prf.detailsIsCancel === 1)) ||
        (statusFilter === "active" && prf.prfIsCancel !== 1 && prf.detailsIsCancel !== 1)

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

  const isRowCanceled = (prf) => {
    return (
      prf.prfIsCancel === true ||
      prf.prfIsCancel === 1 ||
      prf.detailsIsCancel === true ||
      prf.detailsIsCancel === 1 ||
      prf.isCancel === true ||
      prf.isCancel === 1
    )
  }

  return (
    <div className="admin-purchase-container">
      <div className="welcome-container">
        <h2>Welcome to Purchasing Admin Dashboard, {fullname}</h2>
        <p>View and manage all purchase requests from users</p>
      </div>

      <div className="admin-controls">
        <div className="search-container">
          <div className="search-box-list">
            <input
              type="text"
              placeholder="Search by PRF No, User, Description..."
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
            <option value="">Approved</option>
            <option value="">Pending</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="results-summary">
        <p>
          Showing {filteredPrfList.length} of {prfList.length} requests
        </p>
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
                  const isCancelled = isRowCanceled(prf)
                  return (
                    <tr key={index} className={isCancelled ? "canceled-row" : ""}>
                      <td style={{ color: isCancelled ? "red" : "inherit" }}>No. {prf.prfNo}</td>
                      <td>{prf.preparedBy}</td>
                      <td>{formatDate(prf.prfDate)}</td>
                      <td>{prf.StockName || "No stock name available"}</td>
                      <td>{prf.quantity || "N/A"}</td>
                      <td>{prf.unit || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${isCancelled ? "cancelled" : "active"}`}>
                          {isCancelled ? "Cancelled" : "Active"}
                        </span>
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
