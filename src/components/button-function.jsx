import axios from "axios"

// Save PRF header
export const savePrfHeader = async (purchaseCodeNumber, currentDate, fullname, departmentCharge) => {
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
    departmentCharge: departmentCharge || null, // add department charge
  }

  console.log("[v0] Sending PRF header data:", prfHeaderData)

  try {
    const response = await fetch("http://localhost:5000/api/save-table-header", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prfHeaderData),
    })

    const data = await response.json()
    if (response.ok) {
      console.log("✅ PRF header saved with departmentCharge:", data.prfId)
      return data.prfId
    } else {
      console.error("Error saving PRF header:", data.message)
      return null
    }
  } catch (error) {
    console.error("Failed to save PRF header:", error)
    return null
  }
};

// Send stock availability notification to the 3 fixed stock checkers
// Fetches their emails from Users_Info database table
const sendStockAvailabilityNotification = async (
  prfId,
  stockCode,
  stockName,
  prfNo,
  preparedBy
) => {
  try {
    console.log(
      "[v0] Starting stock availability notification for stock code:",
      stockCode
    );

    const company =
      localStorage.getItem("userCompany") || "NutraTech Biopharma, Inc";
    const senderEmail = process.env.REACT_APP_SMTP_USER;
    const smtpPassword = process.env.REACT_APP_SMTP_PASSWORD;

    // Step 1: Fetch stock checkers from database
    console.log("[v0] Fetching stock checkers from database...");
    let stockCheckRecipients = [];

    try {
      const dbResponse = await axios.get(
        "http://localhost:5000/api/get-stock-checkers"
      );

      if (
        dbResponse.data.success &&
        dbResponse.data.recipients &&
        dbResponse.data.recipients.length > 0
      ) {
        stockCheckRecipients = dbResponse.data.recipients;
        console.log(
          "[v0] Successfully fetched stock checkers from database:",
          stockCheckRecipients
        );
      } else {
        console.warn(
          "[v0] No stock checkers returned from database:",
          dbResponse.data
        );
        return {
          success: false,
          message: "No stock checkers configured in database",
        };
      }
    } catch (dbError) {
      console.error(
        "[v0] Error fetching stock checkers from database:",
        dbError
      );
      return {
        success: false,
        message: "Failed to fetch stock checkers: " + dbError.message,
      };
    }

    // Step 2: Validate we have recipients
    if (!stockCheckRecipients || stockCheckRecipients.length === 0) {
      console.error(
        "[v0] No valid stock checker emails found after database fetch"
      );
      return {
        success: false,
        message: "Stock checkers not configured properly",
      };
    }

    console.log("[v0] Sending stock availability notification to:", {
      stockCode,
      stockName,
      prfNo,
      recipientCount: stockCheckRecipients.length,
      recipients: stockCheckRecipients.map((r) => r.email),
    });

    // Step 3: Send notification through backend
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
      console.log(
        "[v0] Stock availability notification sent to all 3 recipients"
      );
      return {
        success: true,
        message: "Stock availability notification sent successfully",
      };
    } else {
      console.error(
        "[v0] Stock availability notification error:",
        response.data
      );
      return {
        success: false,
        message: response.data.message || "Failed to send notification",
      };
    }
  } catch (error) {
    console.error(
      "[v0] Error sending stock availability notification:",
      error
    );
    return {
      success: false,
      message: error.message || "Failed to send notification",
    };
  }
};

// Send email notifications to checkBy, approvedBy, and receivedBy
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
        console.log(
          "[v0] IM stock code detected - sending notification to 3 stock checkers"
        );

        const imStockRow = rows.find((row) => row.stockCode && (row.stockCode === "IM" || row.stockCode.startsWith("IM-")));

        console.log("[v0] IM Stock Row Details:", imStockRow);

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
            console.log("[v0] Stock availability notification sent to 3 recipients successfully");
          } else {
            console.error("[v0] Stock availability notification failed:", stockNotificationResult.message);
          }
        } catch (stockError) {
          console.error("[v0] Error in stock notification:", stockError);
        }
      }

      // THEN send notifications to checkBy, approvedBy, and receivedBy
      console.log("[v0] Sending PRF notifications to checkBy/approvedBy/receivedBy...");

      const notificationResult = await sendPrfNotifications(headerPrfId, prfNo, preparedBy);
      if (notificationResult.success) {
        console.log("[v0] Email notifications sent successfully!");
      } else {
        console.error("[v0] Email notifications failed:",notificationResult.message);
      }

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
