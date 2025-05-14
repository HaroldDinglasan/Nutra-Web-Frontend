import axios from "axios"

// Function to save PRF header
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

// Function to save PRF details
export const savePrfDetails = async (headerPrfId, rows) => {
  if (!headerPrfId) {
    alert("Failed to save PRF header. Please try again.")
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
      qty: Number.parseInt(row.quantity, 10),
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

// Function to update PRF details
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
      qty: Number.parseInt(row.quantity, 10) || 0,
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

// Function to cancel PRF
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
      const result = {
        success: true,
        newCancelCount: response.data.newCancelCount,
        isFullyCancelled: false, // Removed the concept of fully cancelled
      }

      // // Simple alert for cancellation
      // alert(`PRF has been cancelled (Cancel count: ${response.data.newCancelCount})`)

      return result
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
