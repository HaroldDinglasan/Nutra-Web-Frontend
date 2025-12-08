import axios from "axios"

// Save PRF header
export const savePrfHeader = async (purchaseCodeNumber, currentDate, fullname) => {
  if (!purchaseCodeNumber || !currentDate || !fullname) {
    console.error("Missing required data for PRF header")
    return null
  }

  const departmentId = localStorage.getItem("userDepartmentId")
  const userId = localStorage.getItem("userId") // Kinukuha yung UserID sa localStorage

  const prfHeaderData = {
    departmentId: departmentId,
    prfNo: purchaseCodeNumber,
    prfDate: currentDate,
    preparedBy: fullname,
    userId: userId ? parseInt(userId) : null, // add UserID  
  }

  try {
    const response = await fetch("http://localhost:5000/api/save-table-header", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prfHeaderData),
    })

    const data = await response.json()
    if (response.ok) {
      console.log("PRF header saved:", data.prfId)
      return data.prfId
    } else {
      console.error("Error saving PRF header:", data.message)
      return null
    }
  } catch (error) {
    console.error("Failed to save PRF header:", error)
    return null
  }
}

// Send email notifications after successful PRF save
const sendPrfNotifications = async (prfId, prfNo, preparedBy) => {
  try {
    // Get email credentials from localStorage (should be set by backend from .env)
    const checkedByEmail = localStorage.getItem("checkedByEmail");
    const checkedByName = localStorage.getItem("checkedByUser");

    if (!checkedByEmail) {
      console.warn(" No checkBy email configured");
      return { success: true, message: "No emails configured" };
    }

    const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc";
    const userId = localStorage.getItem("userId");
    
    // Get SMTP credentials from environment variables
    const senderEmail = process.env.REACT_APP_SMTP_USER;
    const smtpPassword = process.env.REACT_APP_SMTP_PASSWORD;

    console.log(" Sending PRF notification:", {
      checkedByEmail,
      checkedByName,
      senderEmail, // Debug: verify SMTP credentials are being passed
    });

    const response = await axios.post("http://localhost:5000/api/notifications/send-direct", {
      prfId,
      prfNo, 
      preparedBy,
      company, 
      userId: userId ? Number(userId) : undefined,
      checkedByEmail: localStorage.getItem("checkedByEmail"),
      checkedByName: localStorage.getItem("checkedByUser"), 
      approvedByEmail: localStorage.getItem("approvedByEmail"),  // ibabato sa backend para madisplay sa Outlook email notification
      approvedByName: localStorage.getItem("approvedByUser"),    // ibabato sa backend para madisplay sa Outlook email notification 
      receivedByEmail: localStorage.getItem("receivedByEmail"),  // ibabato sa backend para madisplay sa Outlook email notification
      receivedByName: localStorage.getItem("receivedByUser"),    // ibabato sa backend para madisplay sa Outlook email notification 
      senderEmail, 
      smtpPassword, 
    });

    if (response.data.success) {
      console.log("✅ Email sent to checkBy:", checkedByEmail);
      return { success: true, message: "Email sent successfully" };
    } else {
      console.error("❌ Email service returned error:", response.data);
      return { success: false, message: response.data.message || "Email service error" };
    }
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
    // Show error in notification instead of silently failing
    return { success: false, message: error.response?.data?.message || error.message || "Failed to send email" };
  }
};

// Save PRF details with immediate feedback and background notifications
export const savePrfDetails = async (headerPrfId, rows) => {
  if (!headerPrfId) {
    alert("Failed to save PRF header. Please try again.")
    return false
  }

  // Check if any row with a stockCode has an empty purpose field or date needed field
  const hasEmptyFields = rows.some((row) => {
    if (row.stockCode) {
      const emptyPurpose = !row.purpose || !row.purpose.trim()
      const emptyDateNeeded = !row.dateNeeded || !row.dateNeeded.trim()

      if (emptyPurpose && emptyDateNeeded) {
        alert("Purpose of Requisition and Date Needed are required for all items")
        return true
      } else if (emptyPurpose) {
        alert("Purpose of Requisition is required for all items")
        return true
      } else if (emptyDateNeeded) {
        alert("Date Needed is required for all items")
        return true
      }
    }
    return false
  })

  if (hasEmptyFields) {
    return false
  }

  const prfDetails = rows
    .filter((row) => row.stockCode)
    .map((row) => ({
      prfId: headerPrfId,
      headerPrfId: headerPrfId,
      stockId: row.stockId || crypto.randomUUID(),
      stockCode: row.stockCode,
      stockName: row.description,
      uom: row.unit,
      qty: Number.parseFloat(row.quantity) || 0,
      dateNeeded: row.dateNeeded,
      purpose: row.purpose,
      description: row.description,
    }))

  try {
    const response = await fetch("http://localhost:5000/api/save-prf-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prfDetails),
    })

    const data = await response.json()
    if (response.ok) {
      // Show immediate success message
      alert("PRF saved successfully!")

      // Send notifications in the background (don't wait for completion)
      const prfNo =
        localStorage.getItem("currentPrfNo") ||
        document.querySelector('input[id="purchaseCodeNumber"]')?.value ||
        "New PRF"
      const preparedBy = localStorage.getItem("userFullname") || localStorage.getItem("userName") || "System User"

      console.log("PRF saved successfully, sending notifications in background...")

      // Send notifications asynchronously without blocking the UI
      sendPrfNotifications(headerPrfId, prfNo, preparedBy)
        .then((notificationResult) => {
          if (notificationResult.success) {
            console.log("Email notifications sent successfully!")
            // Optionally show a subtle notification that emails were sent
            setTimeout(() => {
              const emailCount = [
                localStorage.getItem("checkedByEmail"),
                localStorage.getItem("approvedByEmail"),
                localStorage.getItem("receivedByEmail"),
              ].filter(Boolean).length

              if (emailCount > 0) {
                // Show a non-blocking notification
                const notification = document.createElement("div")
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #4CAF50;
                  color: white;
                  padding: 12px 20px;
                  border-radius: 4px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                  z-index: 10000;
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                `
                notification.textContent = `✓ Email notifications sent to ${emailCount} recipient${emailCount > 1 ? "s" : ""}`
                document.body.appendChild(notification)

                // Remove notification after 3 seconds
                setTimeout(() => {
                  if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                  }
                }, 3000)
              }
            }, 1000) // Show after 1 second to let the main alert clear
          } else {
            console.error("Email notifications failed:", notificationResult.message)
            // Optionally show a subtle error notification
            setTimeout(() => {
              const notification = document.createElement("div")
              notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
              `
              notification.textContent = `⚠ Email notifications failed: ${notificationResult.message}`
              document.body.appendChild(notification)

              // Remove notification after 5 seconds
              setTimeout(() => {
                if (notification.parentNode) {
                  notification.parentNode.removeChild(notification)
                }
              }, 5000)
            }, 1000)
          }
        })
        .catch((error) => {
          console.error("Error sending notifications:", error)
        })

      return true
    } else {
      alert("Error saving data: " + data.message)
      return false
    }
  } catch (error) {
    console.error("Error:", error)
    alert("Failed to save data.")
    return false
  }
}

// Update PRF details
export const updatePrfDetails = async (prfId, rows) => {
  if (!prfId) {
    alert("No PRF ID found. Please search for a PRF first.")
    return false
  }

  const prfDetails = rows
    .filter((row) => row.stockCode)
    .map((row) => ({
      prfId: prfId,
      stockId: row.stockId,
      stockCode: row.stockCode,
      stockName: row.description,
      uom: row.unit,
      qty: Number.parseFloat(row.quantity) || 0,
      dateNeeded: row.dateNeeded,
      purpose: row.purpose,
      description: row.description,
    }))

  try {
    const response = await axios.post("http://localhost:5000/api/update-prf-details", {
      prfId,
      details: prfDetails,
    })

    if (response.status === 200) {
      alert("PRF details updated successfully!")
      return true
    } else {
      alert("Error updating PRF details: " + response.data.message)
      return false
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message)
    } else {
      console.error("Error updating PRF details:", error)
      alert("Failed to update PRF details. Please try again.")
    }
    return false
  }
}

// Cancel Prf
export const cancelPrf = async (prfId) => {
  if (!prfId) {
    alert("No PRF ID found. Please search for a PRF first.")
    return false
  }

  if (!window.confirm("Are you sure you want to cancel this PRF?")) {
    return false
  }

  try {
    const response = await axios.post("http://localhost:5000/api/cancel-prf", {
      prfId: prfId,
    })

    if (response.status === 200) {
      if (response.data && response.data.success) {
        const result = {
          success: true,
          isCancel: 1, // Explicitly set to 1 for cancelled
          message: response.data.message || "PRF cancelled successfully",
        }
        alert(result.message)

        // Dispatch event to update status in other components
        window.dispatchEvent(
          new CustomEvent("prfStatusUpdated", {
            detail: { prfId, status: "Cancelled" },
          }),
        )

        return result
      } else {
        alert(
          "Warning: The server response didn't confirm the cancellation was successful. Please verify the PRF status.",
        )
        return {
          success: false,
          message: "Cancellation status unclear",
        }
      }
    } else {
      alert("Error canceling PRF: " + response.data.message)
      return false
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      alert(error.response.data.message)
    } else {
      console.error("Error canceling PRF:", error)
      alert("Failed to cancel PRF. Please try again.")
    }
    return false
  }
}

// Uncancel Prf
export const uncancelPrf = async (prfId) => {
  if (!prfId) {
    alert("No PRF ID found. Please search for a PRF first.")
    return false
  }

  if (!window.confirm("Are you sure you want to uncancel this PRF?")) {
    return false
  }

  try {
    const response = await axios.post("http://localhost:5000/api/uncancel-prf", {
      prfId: prfId,
    })

    // console.log("Uncancel PRF response:", response.data)

    if (response.status === 200 && response.data.success) {
      const result = {
        success: true,
        isCancel: 0, // Explicitly set to 0 for uncancelled
        message: response.data.message || "PRF uncancelled successfully",
      }

      alert(result.message)

      // Dispatch event to update status in other components
      window.dispatchEvent(
        new CustomEvent("prfStatusUpdated", {
          detail: { prfId, status: "Pending" },
        }),
      )

      // Verify the update was successful by making a direct API call
      try {
        const purchaseCodeNumber = document.querySelector('input[id="purchaseCodeNumber"]')?.value || ""
        if (purchaseCodeNumber) {
          const verifyResponse = await axios.get(
            `http://localhost:5000/api/search-prf?prfNo=${encodeURIComponent(purchaseCodeNumber)}`,
          )

          if (verifyResponse.data && verifyResponse.data.found) {
            const isDbCancelled =
              (verifyResponse.data.header && verifyResponse.data.header.prfIsCancel === 1) ||
              verifyResponse.data.isCancel === 1

            console.log("Verification of uncancel status:", !isDbCancelled)

            if (isDbCancelled) {
              return { success: false, needsRefresh: true }
            }
          }
        }
      } catch (error) {
        console.error("Error verifying uncancellation:", error)
      }

      return result
    } else {
      alert("Error uncanceling PRF: " + (response.data.message || "Unknown error"))
      return false
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      // If the server says the PRF is not cancelled
      if (error.response.data.message.includes("not marked as cancelled")) {
        alert("The system shows this PRF is not cancelled. Refreshing data...")
        return { success: false, needsRefresh: true }
      } else {
        alert(error.response.data.message)
      }
    } else {
      console.error("Error uncanceling PRF:", error)
      alert("Failed to uncancel PRF. Please try again.")
    }
    return false
  }
}
