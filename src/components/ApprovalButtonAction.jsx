"use client"
import { useState } from "react"
import "../styles/ApprovalButtonAction.css"
import ApproveOrRejectModal from "./ApproveOrRejectModal"

const ApprovalButtonAction = ({
    action, // cehck, approve, received
    assignedAction, // kung saan i aasign si user galing email
    onAction
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Magsshow lang kapag si user na assigned sa specific action
    const shouldShow = assignedAction === action

    const getButtonLabel = () => {
    switch (action) {
      case "check":
        return "Check"
      case "approve":
        return "Approve"
      case "receive":
        return "Receive"
      default:
        return "Submit"
    }
  }

  const getButtonColor = () => {
    switch (action) {
      case "check":
        return "#FF9500" // Orange for check
      case "approve":
        return "#34C759" // Green for approve
      case "receive":
        return "#007AFF" // Blue for receive
      default:
        return "#0078D7"
    }
  }

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleApprove = async (actionType) => {
    setIsSubmitting(true)
    try {
      if (onAction) {
        await onAction(actionType, null)
      }
    } catch (error) {
      console.error("Error approving:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (actionType, reason) => {
    setIsSubmitting(true)
    try {
      if (onAction) {
        await onAction(actionType, reason)
      }
    } catch (error) {
      console.error("Error rejecting:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldShow) {
    return null
  }

  return (
    <>
      <button
        className="approval-action-button"
        onClick={handleClick}
        disabled={isSubmitting}
        style={{
          backgroundColor: getButtonColor(),
        }}
      >
        {isSubmitting ? `${getButtonLabel()}...` : getButtonLabel()}
      </button>

      <ApproveOrRejectModal
        isOpen={isModalOpen}
        actionType={action}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default ApprovalButtonAction