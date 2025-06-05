import axios from "axios"

// Save PRF header
export const savePrfHeader = async (purchaseCodeNumber, currentDate, fullname) => {
  if (!purchaseCodeNumber || !currentDate || !fullname) {
    console.error("Missing required data for PRF header")
    return null
  }

  const departmentId = localStorage.getItem("userDepartmentId")

  const prfHeaderData = {
    departmentId: departmentId,
    prfNo: purchaseCodeNumber,
    prfDate: currentDate,
    preparedBy: fullname,
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

// Save PRF details
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
    // Return false to prevent saving
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
      alert("Data saved successfully!")
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