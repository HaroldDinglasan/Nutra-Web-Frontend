"use client"
import { useState, useEffect} from "react"
import "../styles/ApproveOrRejectModal.css"

const ApproveOrRejectModal = ({ isOpen, actionType, approverName, onApprove, onReject, onClose }) => {
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedDecision, setSelectedDecision] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  
  if (!isOpen) return null


  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      if (onApprove) {
        await onApprove(actionType)
      }
      handleClose()
    } catch (error) {
      console.error("Error approving:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      if (onReject) {
        await onReject(actionType)
      }
      handleClose()
    } catch (error) {
      console.error("Error rejecting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRejectionReason("")
    setSelectedDecision(null)
    if (onClose) {
      onClose()
    }
  }

  const getActionLabel = () => {
    switch (actionType) {
      case "check":
        return "Check"
      case "approve":
        return "Approve"
      case "receive":
        return "Receive"
      default:
        return "Process"
    }
  }

  const getActionColor = () => {
    switch (actionType) {
      case "check":
        return "#FF9500"
      case "approve":
        return "#34C759"
      case "receive":
        return "#007AFF"
      default:
        return "#0078D7"
    }
  }

 

  return (
    <div className="approve-reject-modal">
      <div className="approve-reject-container">
        <div className="approval-reject-header" style={{ borderLeftColor: getActionColor() }}>
          <div className="modal-header-content">
            <h2>{getActionLabel()} Request</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="approval-modal-body">
          <div className="decision-section">

            {/* Approve Option */}
            <div
              className={`decision-option approve-option ${selectedDecision === "approve" ? "selected" : ""}`}
              onClick={() => {
                setSelectedDecision("approve")
                setRejectionReason("")
              }}
            >
              
              <div className="decision-icon approve-icon">✓</div>
              <div className="decision-content">
                <h3>Approve</h3>
                <p>This {getActionLabel().toLowerCase()} looks good. Proceed forward.</p>
              </div>
              <div className="decision-radio">
                <input
                  type="radio"
                  checked={selectedDecision === "approve"}
                  onChange={() => setSelectedDecision("approve")}
                />
              </div>
            </div>

            {/* Reject Option */}
            <div
              className={`decision-option reject-option ${selectedDecision === "reject" ? "selected" : ""}`}
              onClick={() => setSelectedDecision("reject")}
            >
              <div className="decision-icon reject-icon">✕</div>
              <div className="decision-content">
                <h3>Reject</h3>
                <p>This needs revisions. Please provide reason.</p>
              </div>
              <div className="decision-radio">
                <input
                  type="radio"
                  checked={selectedDecision === "reject"}
                  onChange={() => setSelectedDecision("reject")}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="approval-modal-footer">
          <button className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </button>

          {selectedDecision === "approve" && (
            <button
              className="btn-confirm approve-btn"
              onClick={handleApprove}
              disabled={isSubmitting}
              style={{ backgroundColor: getActionColor() }}
            >
              {isSubmitting ? "Processing..." : `Confirm ${getActionLabel()}`}
            </button>
          )}

          {selectedDecision === "reject" && (
            <button
              className="btn-confirm reject-btn"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Rejection"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApproveOrRejectModal
