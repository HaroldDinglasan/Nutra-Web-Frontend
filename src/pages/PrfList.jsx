"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import "../styles/DashboardAdmin.css"

const DashboardAdmin = () => {
  const location = useLocation()
  const [prfList, setPrfList] = useState([]) // Store PRF data
  const [filteredPrfList, setFilteredPrfList] = useState([]) // Store filtered PRF data
  const [searchTerm, setSearchTerm] = useState("") // Store search term
  const showDashboard = location.hash === "#dashboard"

  // Get user fullname from localStorage
  const fullname = localStorage.getItem("userFullname") || "User"

  useEffect(() => {
    fetchPrfList()
  }, [])

  // Function to check if a date is the same as today
  const checkIsSameDay = (dateToCheck) => {
    if (!dateToCheck) return false

    const today = new Date()
    const checkDate = new Date(dateToCheck)

    return (
      checkDate.getFullYear() === today.getFullYear() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getDate() === today.getDate()
    )
  }

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

  // fetchPrfList function to handle potential issues with user data
  const fetchPrfList = async () => {
    try {
      // Get the current user fullname from localStorage
      const currentUser = localStorage.getItem("userFullname")

      if (!currentUser) {
        console.error("❌ User not found in localStorage")

        const response = await axios.get("http://localhost:5000/api/prf-list")
        setPrfList(response.data)
        setFilteredPrfList(response.data)
        return
      }

      console.log(`Fetching PRFs for user: ${currentUser}`)

      // Fetch PRFs for the current user only
      const response = await axios.get(`http://localhost:5000/api/prf-list/user/${encodeURIComponent(currentUser)}`)

      console.log(`Received ${response.data.length} PRFs from server`)

      if (response.data.length === 0) {
        console.log("No PRFs found for this user, checking if there's a case-sensitivity issue...")

        // If no PRFs found, try fetching all PRFs as a fallback
        const allPrfsResponse = await axios.get("http://localhost:5000/api/prf-list")

        // Filter client-side with case-insensitive comparison
        const userPrfs = allPrfsResponse.data.filter(
          (prf) => prf.preparedBy && prf.preparedBy.toLowerCase() === currentUser.toLowerCase(),
        )

        console.log(`Found ${userPrfs.length} PRFs after case-insensitive filtering`)

        setPrfList(userPrfs)
        setFilteredPrfList(userPrfs)
      } else {
        setPrfList(response.data)
        setFilteredPrfList(response.data)
      }
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error)

      // Fallback to fetching all PRFs if there's an error
      try {
        const response = await axios.get("http://localhost:5000/api/prf-list")
        setPrfList(response.data)
        setFilteredPrfList(response.data)
      } catch (fallbackError) {
        console.error("❌ Error fetching fallback PRF List:", fallbackError)
      }
    }
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
    // Check if header or details are marked as canceled in the database
    const isDbCancelled =
      prf.prfIsCancel === true ||
      prf.prfIsCancel === 1 ||
      prf.detailsIsCancel === true ||
      prf.detailsIsCancel === 1 ||
      prf.isCancel === true ||
      prf.isCancel === 1

    // Check if the PRF date is not today (past the creation day)
    const isSameDay = checkIsSameDay(prf.prfDate)

    // A PRF is considered cancelled ONLY if:
    // It's marked as cancelled in the database
    return isDbCancelled
  }

  return (
    <>
      {showDashboard ? (
        <div className="welcome-container">
          <h2>Welcome to NutraTech Biopharma Inc, {fullname} </h2>
        </div>
      ) : (
        <div className="log-table-container">
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
                filteredPrfList.map((prf, index) => {
                  const isCancelled = isRowCanceled(prf)
                  return (
                    <tr key={index} className={isCancelled ? "canceled-row" : ""}>
                      <td style={{ color: isCancelled ? "red" : "inherit" }}>No. {prf.prfNo}</td>
                      <td>{prf.preparedBy}</td>
                      <td>{formatDate(prf.dateNeeded)}</td>
                      <td>{prf.StockName || "No stock name available"}</td>
                      <td>{prf.quantity || "N/A"}</td>
                      <td>{prf.unit || "N/A"}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6">No matching PRF records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <style jsx>{`
        .canceled-row {
          background-color: rgba(255, 0, 0, 0.05);
        }
      `}</style>
    </>
  )
}

export default DashboardAdmin
