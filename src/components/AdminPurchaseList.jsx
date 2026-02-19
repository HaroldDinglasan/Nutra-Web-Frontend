"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Modal from "./SelectedPrfAdminModal"
import "../styles/AdminPurchaseList.css"
import "../styles/SelectedPrfAdminModal.css"

const AdminPurchaseList = ({ showDashboard = false }) => {
  const [prfList, setPrfList] = useState([])
  const [filteredPrfList, setFilteredPrfList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPrf, setSelectedPrf] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [assignedTo, setAssignedTo] = useState("");

  //       getter          setter
  const [modalStatus, setModalStatus] = useState("")
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const [dateDelivered, setDateDelivered] = useState("");


  useEffect(() => {
    fetchAllPrfList()

    // Event listener for PRF status updates
    const handlePrfStatusUpdate = () => {
        console.log("PRF status updated, refreshing admin data...")
        fetchAllPrfList()
      }

      window.addEventListener("prfStatusUpdated", handlePrfStatusUpdate)

      return () => {
        window.removeEventListener("prfStatusUpdated", handlePrfStatusUpdate)
      }
    }, [])

    const determinePrfStatus =  (prf) => {

    // REJECT STATUS
    if (prf.isReject === 1 || prf.isReject === true) {
      return "REJECTED"
    }

    // Normalize isDelivered to handle "1", 1, true
    const delivered = prf.isDelivered === 1 || prf.isDelivered === true || prf.isDelivered === "1";

    if (delivered) return "RECEIVED";

    // Check if cancelled first
    if (
      prf.prfIsCancel === 1 ||
      prf.prfIsCancel === true ||
      prf.detailsIsCancel === 1 ||
      prf.detailsIsCancel === true ||
      prf.isCancel === 1 ||
      prf.isCancel === true ||
      prf.isCancel === "1"
    ) {
      return "Cancelled";
    }

    // Approved
    if (prf.approvedBy_Status && prf.approvedBy_Status.trim().toUpperCase() === "APPROVED") {
      return "Approved";
    }

    return "PENDING";
  };

  // Fetch all PRF requests for admin
  const fetchAllPrfList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/prf-list");

      // ✅ Apply delivered + calculated status mapping
      const prfListWithStatus = response.data.map((prf) => {
        const delivered =
          prf.isDelivered === 1 ||
          prf.isDelivered === true ||
          prf.isDelivered === "1";
        const calculatedStatus = determinePrfStatus(prf);

        return {
          ...prf,
          status: delivered ? "RECEIVED" : calculatedStatus,
        };
      });

      setPrfList(prfListWithStatus);
      setFilteredPrfList(prfListWithStatus);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error fetching PRF List:", error);
      setIsLoading(false);
    }
  };

  // Handle row click and open modal
  const handleRowClick = async (prf) => {
    try {
      // Set initial state
      setSelectedPrf(prf);
      setSelectedId(prf.Id);
      setSelectedRemarks(prf.remarks || ""); // load existing remarks if available
      setDateDelivered(prf.DateDelivered || ""); // load exisisting date delivered
      setAssignedTo(prf.assignedTo || "");
      setModalStatus(prf.status);
      setIsModalOpen(true);

      // ✅ Fetch latest remarks from backend
      const response = await axios.get(`http://localhost:5000/api/getRemarks/${prf.Id}`);

      if (response.data && response.data.remarks !== undefined) {
        setSelectedRemarks(response.data.remarks);
        setDateDelivered(response.data.DateDelivered || "");
      } else {
        setSelectedRemarks("");
      }
    } catch (error) {
      console.error("❌ Error fetching remarks:", error);
      setSelectedRemarks("");
    } finally {
      // ✅ Always open modal even if API fails
      setIsModalOpen(true);
    }
  };

  // Handle status update
  const handleStatusUpdate = () => {
    if (!selectedPrf) return

    try {
      // Update the local state with new status
      const updatedPrfList = prfList.map((prf) =>
        prf.prfNo === selectedPrf.Id
          ? {
              ...prf,
              status: modalStatus,
              remarks: selectedRemarks,
            }
          : prf,
      )

      setPrfList(updatedPrfList)
      updateFilteredList(updatedPrfList)

      // Close modal
      setIsModalOpen(false)
      setSelectedPrf(null)

      // Dispatch event for other components
      window.dispatchEvent(new Event("prfStatusUpdated"))

      alert(`Status updated to ${modalStatus} successfully!`)
    } catch (error) {
      console.error("❌ Error updating status:", error)
      alert("Failed to update status. Please try again.")
    }
  }

  // Notif requestor / prepared item has been delivered
  // through outlook
  const handleMarkAsReceived = async () => {
    if (!selectedPrf) return

    try {
      // Step 1: Mark item as received in the database
      await axios.put(`http://localhost:5000/api/markAsReceived/${selectedPrf.Id}`)
      await fetchAllPrfList()

      // Step 2: Send notification email via the new endpoint
      try {
        console.log("[v0] Sending delivery notification for PRF:", selectedPrf.prfNo)
        console.log("[v0] Selected Item ID:", selectedPrf.Id)
        console.log("[v0] Stock Name:", selectedPrf.StockName)
        
        const notificationResponse = await axios.post(
          `http://localhost:5000/api/delivered/${selectedPrf.Id}`,
          {
            userFullName: "Admin User",
            senderEmail: process.env.REACT_APP_SMTP_USER || "",
            smtpPassword: process.env.REACT_APP_SMTP_PASSWORD || "",
          }
        )

        console.log("[v0] Notification sent:", notificationResponse.data)
      } catch (notificationError) {
        console.warn("[v0] Email notification warning:", notificationError.message)
      }

      // Step 3: Update local state
      const updatedPrfList = prfList.map((prf) =>
        prf.Id === selectedPrf.Id ? { ...prf, status: "RECEIVED", isDelivered: 1 } : prf,
      )

      setPrfList(updatedPrfList)
      updateFilteredList(updatedPrfList)

      // Step 4: Close modal
      setIsModalOpen(false)
      setSelectedPrf(null)

      // Step 5: Dispatch update event
      window.dispatchEvent(new Event("prfStatusUpdated"))

    } catch (error) {
      console.error("❌ Error marking PRF as received:", error)
      alert("Failed to mark item as received. Please try again.")
    }
  }

  const handleSaveRemarks = async () => {
    if (!selectedId) {
      alert("⚠️ Please select a PRF first!");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/updateRemarks/${selectedId}`, {
        remarks: selectedRemarks,
        dateDelivered: dateDelivered || null,
        assignedTo: assignedTo || null,
      });

      alert("✅ Remarks saved successfully!");

      // ✅ Refresh list to show updated remarks
      await fetchAllPrfList();

      // ✅ Close modal
      setIsModalOpen(false);
      setSelectedRemarks("");
      setSelectedPrf(null);
      setAssignedTo("");

      // ✅ Notify other components
      window.dispatchEvent(new Event("prfStatusUpdated"));
    } catch (error) {
      console.error("❌ Error saving remarks:", error);
      alert("Failed to save remarks. Please try again.");
    }
  };

  // Helper function to update filtered list
  const updateFilteredList = (updatedPrfList) => {
    const updatedFilteredList = updatedPrfList.filter((prf) => {
      // Apply search filter
      let term = searchTerm.toLowerCase()
      if (term.startsWith("no. ")) {
        term = term.substring(4)
      }

      const prfNoStr = prf.prfNo ? prf.prfNo.toString().toLowerCase() : ""

      const searchMatch =
        !searchTerm.trim() ||
        prfNoStr.includes(term) ||
        (prf.preparedBy && prf.preparedBy.toLowerCase().includes(term)) ||
        (prf.assignedTo && prf.assignedTo.toLowerCase().includes(term)) || // ADDED
        (prf.prfDate && formatDate(prf.prfDate).toLowerCase().includes(term)) ||
        (prf.StockName && prf.StockName.toLowerCase().includes(term))

      // Apply status filter
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "cancelled" && prf.status === "Cancelled") ||
        (statusFilter === "reject" && prf.status === "REJECTED") ||
        (statusFilter === "PENDING" && prf.status === "PENDING") ||
        (statusFilter === "approved" && prf.status === "Approved") ||
        (statusFilter === "RECEIVED" && prf.status === "RECEIVED") ||
        (statusFilter === "Assigned" && prf.assignedTo && prf.assignedTo.trim() !== "") ||
        (statusFilter === "Unassigned" && (!prf.assignedTo || prf.assignedTo.trim() === ""))
      return searchMatch && statusMatch
    })

    setFilteredPrfList(updatedFilteredList)
  }

  // Calculate counts
  const pendingCount = prfList.filter((prf) => prf.status === "PENDING").length
  const approvedCount = prfList.filter((prf) => prf.status === "Approved").length
  const receivedCount = prfList.filter((prf) => prf.status === "RECEIVED").length
  const cancelledCount = prfList.filter((prf) => prf.status === "Cancelled").length

  // Effect to filter the PRF list based on search term and status
  useEffect(() => {
    const fetchFilteredList = async () => {
      try {
       if (statusFilter === "RECEIVED") {

        const response = await axios.get("http://localhost:5000/api/getDeliveredList")

        const deliveredData = Array.isArray(response.data)
          ? response.data
          : response.data.data || []

        const deliveredList = deliveredData.map((prf) => ({
          ...prf,
          status: "RECEIVED",
        }))

        const searchedList = deliveredList.filter((prf) => {
          let term = searchTerm.toLowerCase()
          if (term.startsWith("no. ")) term = term.substring(4)

          const prfNoStr = prf.prfNo ? prf.prfNo.toString().toLowerCase() : ""
          return (
            !searchTerm.trim() ||
            prfNoStr.includes(term) ||
            (prf.preparedBy && prf.preparedBy.toLowerCase().includes(term)) ||
            (prf.assignedTo && prf.assignedTo.toLowerCase().includes(term)) || // ADDED
            (prf.prfDate && formatDate(prf.prfDate).toLowerCase().includes(term)) ||
            (prf.StockName && prf.StockName.toLowerCase().includes(term))
          )
        })

          setFilteredPrfList(searchedList)
          return
        }


        // Default: Apply local filtering for other statuses
        let term = searchTerm.toLowerCase()
        if (term.startsWith("no. ")) {
          term = term.substring(4)
        }

        const filtered = prfList.filter((prf) => {
          const prfNoStr = prf.prfNo ? prf.prfNo.toString().toLowerCase() : ""

          const statusMatch =
            statusFilter === "all" ||
            (statusFilter === "cancelled" && prf.status === "Cancelled") ||
            (statusFilter === "reject" && prf.status === "REJECTED") ||
            (statusFilter === "PENDING" && prf.status === "PENDING") ||
            (statusFilter === "approved" && prf.status === "Approved") ||
            (statusFilter === "Assigned" && prf.assignedTo && prf.assignedTo.trim() !== "") ||
            (statusFilter === "Unassigned" && (!prf.assignedTo || prf.assignedTo.trim() === ""))

          if (!statusMatch) return false

          return (
            prfNoStr.includes(term) ||
            (prf.preparedBy && prf.preparedBy.toLowerCase().includes(term)) ||
            (prf.assignedTo && prf.assignedTo.toLowerCase().includes(term)) || // ADDED
            (prf.prfDate && formatDate(prf.prfDate).toLowerCase().includes(term)) ||
            (prf.StockName && prf.StockName.toLowerCase().includes(term))
          )
        })

        setFilteredPrfList(filtered)
      } catch (error) {
        console.error("❌ Error fetching delivered list:", error)
      }
    }

    fetchFilteredList()
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "pending"

      case "Approved":
        return "approved"

      case "RECEIVED":
        return "received"

      case "Cancelled":
        return "cancelled"

      case "REJECTED":
        return "rejected"

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
              <div className="stats-label">UNASSIGNED</div>
            </div>
          </div>

          <div className="stats-card received-card">
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
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <div className="stats-content">
              <div className="stats-number">{isLoading ? "..." : receivedCount}</div>
              <div className="stats-label">DELIVERED</div>
              <div className="stats-description">Successfully received</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-purchase-container">
      <div className="welcome-container">
        <h2>Welcome to Purchasing Admin Dashboard</h2>
        <p style={{ color: "#6b7280", marginTop: "8px" }}>Click on any request to view details and update status</p>
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
            onChange={(e) => {
              const selectedStatus = e.target.value
              setStatusFilter(selectedStatus)
            }}
            className="status-admin-filter"
          >
            <option value="all">All</option>
            <option value="Assigned">Assigned</option>
            <option value="Unassigned">Unassigned</option>
            <option value="PARTIALDELIVERED">Partially Delivered</option>
            <option value="PENDING">Pending</option>
            <option value="approved">Approved</option>
            <option value="RECEIVED">Received</option>
            <option value="For-approval">For Approval</option>
            <option value="cancelled">Cancelled</option>
            <option value="reject">Reject</option>
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
                <th>Assigned To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrfList.length > 0 ? (
                filteredPrfList.map((prf, index) => {
                  const isCancelled = prf.status === "Cancelled"
                  const isUnreceived = prf.status === "Unreceived"
                  return (
                    <tr
                      key={index}
                      className={`${isCancelled ? "canceled-row" : ""} ${isUnreceived ? "unreceived-row" : ""} clickable-row`}
                      onClick={() => handleRowClick(prf)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ color: isCancelled ? "red" : isUnreceived ? "#dc2626" : "inherit" }}>
                        No. {prf.prfNo}
                      </td>
                      <td>{prf.preparedBy}</td>
                      <td>{formatDate(prf.prfDate)}</td>
                      <td>{prf.StockName || "No stock name available"}</td>
                      <td>{prf.quantity || "N/A"}</td>
                      <td>{prf.unit || "N/A"}</td>
                      <td>{prf.assignedTo || "" }</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(prf.status)}`}>{prf.status}</span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-results">
                    No matching PRF records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="modal-header">
          <svg className="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 className="modal-title">Purchase Request Details</h2>
        </div>

        {selectedPrf && (
          <div>
            <div className="detail-grid">
              <div className="detail-card">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                <div className="detail-content">
                  <h4>PRF Number</h4>
                  <p>No. {selectedPrf.prfNo}</p>
                </div>
              </div>

              <div className="detail-card">
                <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="detail-content">
                  <h4>Prepared By</h4>
                  <p>{selectedPrf.preparedBy}</p>
                </div>
              </div>
            </div>

            <div className="detail-card" style={{ marginBottom: "16px" }}>
              <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 13a2 2 0 002 2h8a2 2 0 002-2L16 7"
                />
              </svg>
              <div className="detail-content">
                <h4>Date</h4>
                <p>{formatDate(selectedPrf.prfDate)}</p>
              </div>
            </div>

            <div className="description-section">
              <h4>Item Description</h4>
              <p>{selectedPrf.StockName || "No description available"}</p>
            </div>

            <div className="quantity-grid">
              <div className="quantity-card">
                <h4>Quantity</h4>
                <p>{selectedPrf.quantity|| "N/A"}</p>
              </div>

              <div className="quantity-card">
                <h4>Unit</h4>
                <p>{selectedPrf.unit || "N/A"}</p>
              </div>
            </div>

            <div className="remarks-section" style={{ marginTop: "16px" }}>
              <label className="remarks-label">
                 📝 Remarks
              </label>
              <textarea
                value={selectedRemarks || ""}
                onChange={(e) => setSelectedRemarks(e.target.value)}
                placeholder="Enter remarks..."
                className="remarks-input"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  marginTop: "8px",
                  minHeight: "80px",
                  resize: "vertical",
                }}
              />
            </div>

            <div className="assigned-to-section" style={{ marginTop: "16px" }}>
              <label className="assign-label">
                👤 Assigned To
              </label>              
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter assignee name"
                className="assigned-to-input"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              />
            </div>

            <div className="delivery-date-section" style={{ marginTop: "16px" }}>
              <h4>Delivered Date:</h4>
              <input
                type="date"
                value={dateDelivered ? dateDelivered.split("T")[0] : ""}
                onChange={(e) => setDateDelivered(e.target.value)}
                className="delivery-date-input"
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  marginTop: "8px",
                  width: "100%",
                  maxWidth: "200px",
                }}
              />
            </div>

            <div className="button-container" style={{ marginTop: "24px" }}>
              <button onClick={handleSaveRemarks} className="update-admin-button">
                SAVE
              </button>

              {selectedPrf.status !== "RECEIVED" && selectedPrf.status !== "Cancelled" && (
                <>
                  <button onClick={handleMarkAsReceived} className="received-admin-button">
                    <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    DELIVERED
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPurchaseList
