"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/page.css"

const PRFViewPage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const prfId = params.id
  const [prfData, setPrfData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prfId) {
      fetchPrfData()
    }
  }, [prfId])

  const fetchPrfData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/prf/${prfId}`)
      setPrfData(response.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    navigate("/prf/list")
   }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    return dateString
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <div className="prf-modal-content" style={{ margin: "0 auto", marginTop: "20px" }}>
        <div className="prf-modal-header">
          <h2>View Purchase Request Form</h2>
          <button
            className="prf-modal-close"
            onClick={handleBack}
            style={{ cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div className="prf-modal-body">
          {loading ? (
            <div className="prf-loading">
              <div className="prf-spinner"></div>
              <p>Loading PRF details...</p>
            </div>
          ) : prfData ? (
            <>
              {/* PRF Header Section */}
              <div className="prf-header-section">
                <div className="prf-company-info">
                  <h3>NutraTech Biopharma, Inc.</h3>
                  <p>Brgy. Balubad II, Silang Cavite, Philippines</p>
                  <p>Tels.: (02) 579-0954 • (02) 986-0729 • (02) 925-9515</p>
                </div>
                <div className="prf-title-number">
                  <h1>PURCHASE REQUEST FORM</h1>
                </div>
                <div className="prf-number">
                  {prfData.header?.prfNo || "N/A"}
                </div>
              </div>

              {/* PRF Info Grid */}
              <div className="prf-info-grid">
                <div className="prf-info-item">
                  <label>Department (charge to):</label>
                  <p>{prfData.header?.projectCode || "N/A"}</p>
                </div>
                <div className="prf-info-item">
                  <label>Date:</label>
                  <p>{formatDate(prfData.header?.prfDate)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="prf-items-section">
                <p className="prf-text">I would like to request the following :</p>
                <table className="prf-items-table">
                  <thead>
                    <tr>
                      <th>STOCK CODE</th>
                      <th>Qty</th>
                      <th>UNIT</th>
                      <th>DESCRIPTION</th>
                      <th>DATE NEEDED</th>
                      <th>PURPOSE OF REQUISITION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prfData.details && prfData.details.length > 0 ? (
                      prfData.details.map((detail, index) => (
                        <tr key={index}>
                          <td>{detail.StockCode || "N/A"}</td>
                          <td>{detail.quantity || "N/A"}</td>
                          <td>{detail.unit || "N/A"}</td>
                          <td>{detail.StockName || detail.Description || "N/A"}</td>
                          <td>{formatDate(detail.DateNeeded)}</td>
                          <td>{detail.Purpose || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Approval Section */}
              <div className="prf-approval-section">
                <div className="page-approval-box">
                  <div className="approval-header">
                    <span className="approval-title">Prepared By:</span>
                  </div>
                  <p className="page-approval-name-prepare">{prfData.header?.preparedBy || "N/A"}</p>
                  <p className="page-approval-date">{formatDate(prfData.header?.prfDate)}</p>
                </div>

                <div className="page-approval-box">
                  <div className="approval-header">
                    <span className="approval-title">Checked By:</span>
                    {prfData.header?.checkedBy_Status === "APPROVED" && (
                      <span className="approval-icon verified">✓</span>
                    )}
                  </div>
                  <p className="page-approval-name">{prfData.header?.checkedBy || "N/A"}</p>
                  <p className="page-approval-date">
                    {prfData.header?.checkedByDateTime
                      ? formatDate(prfData.header.checkedByDateTime)
                      : "N/A"}
                  </p>
                </div>

                <div className="page-approval-box">
                  <div className="approval-header">
                    <span className="approval-title">Approved By:</span>
                    {prfData.header?.approvedBy_Status === "APPROVED" && (
                      <span className="approval-icon verified">✓</span>
                    )}
                  </div>
                  <p className="page-approval-name">{prfData.header?.approvedBy || "N/A"}</p>
                  <p className="page-approval-date">
                    {prfData.header?.approvedByDateTime
                      ? formatDate(prfData.header.approvedByDateTime)
                      : "N/A"}
                  </p>
                </div>

                <div className="page-approval-box">
                  <div className="approval-header">
                    <span className="approval-title">Received By:</span>
                    {prfData.header?.receivedBy_Status === "APPROVED" && (
                      <span className="approval-icon verified">✓</span>
                    )}
                  </div>
                  <p className="page-approval-name">{prfData.header?.receivedBy || "N/A"}</p>
                  <p className="page-approval-date">
                    {prfData.header?.receivedByDateTime
                      ? formatDate(prfData.header.receivedByDateTime)
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="prf-modal-footer">
                <button className="prf-print-btn" onClick={handlePrint}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  PRINT
                </button>
                <button className="prf-close-btn" onClick={handleBack}>
                  BACK
                </button>
              </div>
            </>
          ) : (
            <div className="prf-error">
              <p>Failed to load PRF details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PRFViewPage