import axios from "axios" // Used for sending HTTP requests to backend

// Save PRF header
export const savePrfHeader = async (purchaseCodeNumber, currentDate, fullname, departmentCharge) => {

  // Check if required fields are missing
  if (!purchaseCodeNumber || !currentDate || !fullname) {
    console.error("Missing required data for PRF header")
    return null
  }

  // Get department and user info from localStorage
  const departmentId = localStorage.getItem("userDepartmentId")
  const userId = localStorage.getItem("userId") 

  // Create object that will be sent to backend
  const prfHeaderData = {
    departmentId: departmentId,
    prfNo: purchaseCodeNumber,
    prfDate: currentDate,
    preparedBy: fullname,
    userId: userId ? parseInt(userId) : null, 
    departmentCharge: departmentCharge || null,
  }

  // Send data to backend
  try {
    const response = await fetch("http://localhost:5000/api/save-table-header", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prfHeaderData),
    })

    const data = await response.json()

    if (response.ok) {
      return data.prfId
    } else {
      return null
    }
  } catch (error) {
    return null
  }
};

// Send stock availability notification to the 3 fixed stock checkers
// Fetches their emails from Users_Info database table
const sendStockAvailabilityNotification = async ( prfId, stockCode, stockName, prfNo, preparedBy) => {

  try {

    const company =
      localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc";
    const senderEmail = process.env.REACT_APP_SMTP_USER;
    const smtpPassword = process.env.REACT_APP_SMTP_PASSWORD;

    // Step 1: Fetch stock checkers from database
    let stockCheckRecipients = [];

    try {
      // Step 1: Get stock checkers from database
      const dbResponse = await axios.get("http://localhost:5000/api/get-stock-checkers");

      if (
        dbResponse.data.success &&
        dbResponse.data.recipients &&
        dbResponse.data.recipients.length > 0
      ) {
        stockCheckRecipients = dbResponse.data.recipients;
      } else {
        return {
          success: false,
          message: "No stock checkers configured in database",
        };
      }
    } catch (dbError) {
      return {
        success: false,
        message: "Failed to fetch stock checkers: " + dbError.message,
      };
    }

    if (!stockCheckRecipients || stockCheckRecipients.length === 0) {
      return {
        success: false,
        message: "Stock checkers not configured properly",
      };
    }

    // Step 2: Send email through backend
    const response = await axios.post(
      "http://localhost:5000/api/notifications/stock-availability",
      {
        prfId,
        stockCode,
        stockName,
        prfNo,
        preparedBy,
        company,
        recipients: stockCheckRecipients,
        senderEmail,
        smtpPassword,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: "Stock availability notification sent successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send notification",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to send notification",
    };
  }
};

// Send email notifications to checkBy, approvedBy, and receivedBy
// If hasImStock is true, this will be skipped during PRF save and called later after CGS approval
const sendPrfNotifications = async (prfId, prfNo, preparedBy, hasImStock = false) => {
  try {
    // Get email credentials from localStorage (should be set by backend from .env)
    const checkedByEmail = localStorage.getItem("checkedByEmail");
    const checkedByName = localStorage.getItem("checkedByUser");

    if (!checkedByEmail) {
      return { success: true, message: "No emails configured" };
    }

    const company = localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc";
    const userId = localStorage.getItem("userId");

    // Get SMTP credentials from environment variables
    const senderEmail = process.env.REACT_APP_SMTP_USER;
    const smtpPassword = process.env.REACT_APP_SMTP_PASSWORD;

    // Send email using backend
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
      return { success: true, message: "Email sent successfully" };
    } else {
      return { success: false, message: response.data.message || "Email service error" };
    }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message || "Failed to send email" };
  }
};


// Save PRF details and handle notifications
// 1. If IM stock code is detected, send notification to 3 stock checkers FIRST
// 2. Then send to checkBy, approvedBy, and receivedBy
export const savePrfDetails = async (headerPrfId, rows) => {
  if (!headerPrfId) {
    alert("Failed to save PRF header. Please try again.")
    return false
  }

  // Validate required fields
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

  // Convert rows into format for backend
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
      alert("PRF saved successfully!")

      setTimeout(() => {
        window.location.reload();
      }, 500);

      // Send notifications in the background (don't wait for completion)
      const prfNo =
        localStorage.getItem("currentPrfNo") ||
        document.querySelector('input[id="purchaseCodeNumber"]')?.value ||
        "New PRF"
      const preparedBy =
        localStorage.getItem("userFullname") ||
        localStorage.getItem("userName") ||
        "System User";

      // Check if any row contains IM stock code (starts with "IM-" or exact "IM")
      const hasImStock = rows.some((row) => row.stockCode && (row.stockCode === "IM" || row.stockCode.startsWith("IM-")));

      // IMPORTANT: Send stock availability notification FIRST to the 3 stock checkers
      if (hasImStock) {

        const imStockRow = rows.find((row) => row.stockCode && (row.stockCode === "IM" || row.stockCode.startsWith("IM-")));

        // Send stock availability notification and WAIT for it to complete
        try {
          const stockNotificationResult = await sendStockAvailabilityNotification(
            headerPrfId,
            imStockRow?.stockCode || "IM",
            imStockRow?.description || imStockRow?.stockName || "IM Stock",
            prfNo,
            preparedBy
          );

          if (stockNotificationResult.success) {
          } else {
          }
        } catch (stockError) {
        }
      }

      // THEN send notifications to checkBy, approvedBy, and receivedBy
      // BUT: If IM stock is detected, SKIP sending checkBy notification here
      // It will be sent AFTER the CGS approval + requestor notification
      if (!hasImStock) {
        const notificationResult = await sendPrfNotifications(headerPrfId, prfNo, preparedBy, false);
        if (notificationResult.success) {
        } else {
        }
      } else {
      }

      return true
    } else {
      alert("Error saving data: " + data.message)
      return false
    }
  } catch (error) {
    alert("Failed to save data.")
    return false
  }
}

// Other functions remain the same (updatePrfDetails, cancelPrf, uncancelPrf)
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

            if (isDbCancelled) {
              return { success: false, needsRefresh: true }
            }
          }
        }
      } catch (error) {
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
      alert("Failed to uncancel PRF. Please try again.")
    }
    return false
  }
}
