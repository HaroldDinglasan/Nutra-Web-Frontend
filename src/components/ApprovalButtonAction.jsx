"use client"
import { useState } from "react"
import "../styles/ApprovalButtonAction.css"
import ApproveOrRejectModal from "./ApproveOrRejectModal"

const ApprovalButtonAction = ({ 
  action, // check, approve, receive
  assignedAction, // kung saan i aasign si user galing email
  onAction, 
  prfId, // Added prfId prop for API call
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
      if (!prfId) {
        alert("PRF ID is missing. Please refresh the page and try again.")
        setIsSubmitting(false)
        return
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}")

      let senderEmail = localStorage.getItem("senderEmail")
      let smtpPassword = localStorage.getItem("smtpPassword")

      // Kapag wala sa local storage, pede kunin sa .env.local
      if (!senderEmail) {
        senderEmail = process.env.REACT_APP_SMTP_USER || "dinglasan.harold.ian.dave@gmail.com"
      }
      if (!smtpPassword) {
        smtpPassword = process.env.REACT_APP_SMTP_PASSWORD || "yxvi pzmc lnah cywl"
      }

      const checkedByName = localStorage.getItem("checkedByUser") || "N/A" // dinagdag para hindi mawala ang fullnames sa Outlook notification
      const approvedByName = localStorage.getItem("approvedByUser") || "N/A"
      const receivedByName = localStorage.getItem("receivedByUser") || "N/A"

      console.log("Calling approval endpoint with:", {
        prfId,
        actionType,
        userFullName: userData.fullName,
        hasSenderEmail: !!senderEmail,
        hasSmtpPassword: !!smtpPassword,
        approverNames: { checkedByName, approvedByName, receivedByName },
      })

      const response = await fetch(`http://localhost:5000/api/prf/approve/${prfId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType: actionType,
          userFullName: userData.fullName || "System User",
          senderEmail,
          smtpPassword,
          checkedByName, // dinagdag para hindi mawala ang fullnames sa Outlook notification
          approvedByName,
          receivedByName,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        console.log(" Approval successful, notification result:", data)
        if (onAction) {
          await onAction(actionType, null)
        }
        alert(`✅ PRF has been ${actionType}ed successfully!`)
      } else {
        alert(` Error: ${data.message}`)
      }
    } catch (error) {
      console.error(" Error during approval:", error)
      alert(" An error occurred while processing the approval")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (actionType, rejectionReason) => {
    setIsSubmitting(true)
    try {
      if (!prfId) {
        alert(" PRF ID is missing. Please refresh the page and try again.")
        setIsSubmitting(false)
        return
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}")

      const requestBody = {
        userFullName: userData.fullName || "System User",
        rejectionReason: rejectionReason || "",
      }

      // Call the rejection endpoint
      const response = await fetch(`http://localhost:5000/api/prf/reject/${prfId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (onAction) {
          await onAction("reject", rejectionReason)
        }
        alert(`✅ PRF has been rejected successfully!`)
      } else {
        alert(`❌ Error: ${data.message}`)
      }
    } catch (error) {
      console.error("Error rejecting:", error)
      alert("❌ An error occurred while processing the rejection")
    } finally {
      setIsSubmitting(false)
    }
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
