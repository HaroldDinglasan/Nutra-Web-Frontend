"use client"

import { useState, useEffect } from "react"
import "../styles/NutratechForm.css"
import { useLocation, useNavigate } from "react-router-dom"

import NutraTechlogo from "../assets/NTBI.png"
import avliLogo from "../assets/AVLI.png"
import apthealthLogo from "../assets/apthealth inc full logo.png"

import nutraheaderlogo from "../assets/nutratechlogo.jpg"
import apthealtheaderLogo from "../assets/apthealth logo.png"
import avliheaderLogo from "../assets/avli biocare.logo.png"

import StockcodeModal from "./StockcodeModal"
import UomModal from "../components/UomModal"
import Button, { SaveButton, UpdateButton, CancelButton, AddRowButton } from "../components/button"
import { savePrfHeader, savePrfDetails, updatePrfDetails, cancelPrf } from "../components/button-function"

const NutraTechForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [company, setCompany] = useState("NutraTech Biopharma, Inc") // Default value
  const [purchaseCodeNumber, setPurchaseCodeNumber] = useState("")
  const [prfId, setPrfId] = useState(null) // Store the PRF ID
  const [isUpdating, setIsUpdating] = useState(false) // Track if we're in update mode
  const [isPrfCancelled, setIsPrfCancelled] = useState(false) // Track if the PRF is cancelled
  const [cancelButtonLabel, setCancelButtonLabel] = useState("Cancel")
  const fullname = localStorage.getItem("userFullname") || "" // Retrieve fullname
  const department = localStorage.getItem("userDepartment") || "" // Retrieve department
  const [isUomModalOpen, setIsUomModalOpen] = useState(false)
  const [selectedUomRowIndex, setSelectedUomRowIndex] = useState(null)

  useEffect(() => {
    if (location.state && location.state.company) {
      setCompany(location.state.company)
    } else {
      alert("No company selected. Please login again.")
      navigate("/login")
    }
  }, [location.state, navigate])

  // Generate a unique purchase code
  useEffect(() => {
    if (company) {
      generatePurchaseCode(company)
    }
  }, [company])

  // Listen for search results from app-layout.jsx
  useEffect(() => {
    const handleSearchResults = () => {
      const searchResultsStr = sessionStorage.getItem("prfSearchResults")
      if (searchResultsStr) {
        const data = JSON.parse(searchResultsStr)

        // Set the PRF header information
        setPurchaseCodeNumber(data.header.prfNo)
        setCurrentDate(data.header.prfDate.split("T")[0])
        setPrfId(data.header.prfId)

        // Check if the PRF is cancelled and update state
        const isCancelled = data.header.prfIsCancel === true
        setIsPrfCancelled(isCancelled)

        // Set the cancel button label depending on cancel
        if (data.header.prfIsCancel === true) {
          setCancelButtonLabel("Marked as Cancelled")
        } else {
          setCancelButtonLabel("Cancel")
        }

        // Set the PRF details in the table
        const newRows = data.details.map((detail) => ({
          stockCode: detail.StockCode,
          quantity: detail.quantity.toString(),
          unit: detail.unit,
          description: detail.StockName,
          dateNeeded: detail.dateNeeded,
          purpose: detail.purpose,
          stockId: detail.stockId || "", 
        }))

        // If there are fewer details than rows, pad with empty rows
        while (newRows.length < 5) {
          newRows.push({
            stockCode: "",
            quantity: "",
            unit: "",
            description: "",
            dateNeeded: "",
            purpose: "",
            stockId: "",
          })
        }

        setRows(newRows)
        setIsUpdating(true) // Set to update mode since we're loading existing data

        // Clear the session storage
        sessionStorage.removeItem("prfSearchResults")
      }
    }

    // Check for existing search results when component mounts
    handleSearchResults()

    // Listen for future search events
    window.addEventListener("prfSearchCompleted", handleSearchResults)

    return () => {
      window.removeEventListener("prfSearchCompleted", handleSearchResults)
    }
  }, [])

  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => ({
      stockCode: "",
      quantity: "",
      unit: "",
      description: "",
      dateNeeded: "",
      purpose: "",
      stockId: "", // Add stockId field
    })),
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null)

  // Function to handle stock selection
  const handleStockSelect = (stock) => {
    if (selectedRowIndex !== null) {
      console.log("Selected stock:", stock) // Log the entire stock object
      console.log("Stock Id:", stock.Id) // Log the Id specifically
      
      const newRows = [...rows]
      newRows[selectedRowIndex].stockCode = stock.StockCode
      newRows[selectedRowIndex].unit = stock.BaseUOM
      newRows[selectedRowIndex].description = stock.StockName
      newRows[selectedRowIndex].stockId = stock.Id // Store the stock Id
      setRows(newRows)
    }
  }

  // Function to handle UOM selection
  const handleUomSelect = (uom) => {
    console.log("Selected UOM:", uom) 
    
    if (selectedUomRowIndex !== null) {
      const newRows = [...rows]
      newRows[selectedUomRowIndex].unit = uom
      setRows(newRows)
    }
  }

  const handleInputChange = (index, event) => {
    const { name, value } = event.target
    const newRows = [...rows]

    if (name === "quantity") {
      // Validation for integers
      if (/^\d*$/.test(value)) {
        newRows[index][name] = value
        setRows(newRows)
      } else {
        alert("Please enter a valid integer for quantity.")
      }
    } else if (name === "dateNeeded") {
      // Validation for MM/DD/YYYY format
      if (value.length === 10) {
        const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
        if (!datePattern.test(value)) {
          alert("Please enter a valid date in MM/DD/YYYY format.")
          return
        }
      }
      newRows[index][name] = value
      setRows(newRows)
    } else {
      newRows[index][name] = value
      setRows(newRows)
    }
  }

  const handleDateChange = (event) => {
    setCurrentDate(event.target.value)
  }

  // Function to generate a unique purchase code based on company name
  const generatePurchaseCode = (companyName) => {
    // Map company names to their specific code letters
    const companyCodeMap = {
      "NutraTech Biopharma, Inc": "N",
      "Avli Biocare, Inc": "B",
      "Apthealth, Inc": "P",
    }

    // Get the correct letter for the company
    const codeLetter = companyCodeMap[companyName] || companyName.charAt(0).toUpperCase()

    // Generate 5 random digits
    const randomDigits = Math.floor(10000 + Math.random() * 90000)

    // Set the purchase code
    const newCode = `${codeLetter} ${randomDigits}`
    setPurchaseCodeNumber(newCode)
  }

  // Function after generate PurchaseCode function
  const handleSavePrfHeader = async () => {
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
        console.log("PRF header saved:", data.prfId) // Get PRF ID from backend
        setPrfId(data.prfId) // Store the backend-generated PRF ID
        return data.prfId // Return PRF ID from backend
      } else {
        console.error("Error saving PRF header:", data.message)
        return null
      }
    } catch (error) {
      console.error("Failed to save PRF header:", error)
      return null
    }
  }

  const headerLogos = {
    "NutraTech Biopharma, Inc": nutraheaderlogo,
    "Avli Biocare, Inc": avliheaderLogo,
    "Apthealth, Inc": apthealtheaderLogo,
  }

  const companyLogos = {
    "NutraTech Biopharma, Inc": NutraTechlogo,
    "Avli Biocare, Inc": avliLogo,
    "Apthealth, Inc": apthealthLogo,
  }

  const handleSave = async () => {
    let headerPrfId = prfId

    if (!headerPrfId) {
      headerPrfId = await savePrfHeader(purchaseCodeNumber, currentDate, fullname)
    }
    
    const success = await savePrfDetails(headerPrfId, rows)
    if (success) {
      setPrfId(headerPrfId)
    }
  }

  // Function to handle updating PRF details
  const handleUpdate = async () => {
    const success = await updatePrfDetails(prfId, rows)
    if (success) {
      setIsUpdating(false)
    }
  }

  const handleAddRow = () => {
    setRows([...rows, { stockCode: "", quantity: "", unit: "", description: "", dateNeeded: "", purpose: "", stockId: "" }])
  }

  const handleCancel = async () => {
    const success = await cancelPrf(prfId)
    if (success) {
      setCancelButtonLabel("Marked as Cancelled")
      setIsPrfCancelled(true)
    }
  }

  // Style for cancelled PRF details
  const cancelledStyle = {
    color: isPrfCancelled ? "red" : "inherit",
  }

  return (
    <>
      <div className="form-container">
        <div className="form-box-container">
          {isPrfCancelled && (
            <div
              className="cancelled-banner"
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                color: "red",
                marginBottom: "10px",
                border: "1px solid red",
                borderRadius: "4px",
              }}
            >
              This PRF has been cancelled
            </div>
          )}

          <div className="header">
            <div>
              <div className="logo">
                <img src={companyLogos[company] || "/placeholder.svg"} alt="Company Logo" />
              </div>
              <h3 className="header-three">Brgy. Balubad II, Silang Cavite, Philippines</h3>
              <h3 className="header-four">Tels.: • (02) 579-0954 • (02) 986-0729 • (02) 925-9515</h3>
            </div>
          </div>

          <div className="form-header">
            <div className="purchase-code-number" style={cancelledStyle}>
              <label>No. {purchaseCodeNumber}</label>
            </div>
            <h1 className="header-one-label">PURCHASE REQUEST FORM</h1>
          </div>

          <div className="field-box">
            <div className="input-container">
              <label className="header-dept-label" htmlFor="department">
                Department (charge to):
              </label>
              <input type="text" id="department" className="department-display" value={department} readOnly />
            </div>

            <div className="date-container">
              <label className="date-label">Date:</label>
              <input
                type="date"
                id="date"
                className="date-input"
                value={currentDate}
                onChange={handleDateChange}
                required
              />
            </div>
          </div>

          <div className="following-label">
            <label>I would like to request the following :</label>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <label
                      onClick={() => {
                        if (!isPrfCancelled) {
                          setIsModalOpen(true)
                          setSelectedRowIndex(0)
                        }
                      }}
                      style={{ cursor: isPrfCancelled ? "default" : "pointer" }}
                    >
                      STOCK CODE
                    </label>
                  </th>
                  <th>QUANTITY</th>
                  <th>
                    <label
                      onClick={() => {
                        if (!isPrfCancelled) {
                          setIsUomModalOpen(true)
                          setSelectedUomRowIndex(0)
                        }
                      }}
                      style={{ cursor: isPrfCancelled ? "default" : "pointer" }}
                    >
                      UNIT
                    </label>
                  </th>
                  <th>DESCRIPTION</th>
                  <th>DATE NEEDED</th>
                  <th>PURPOSE OF REQUISITION</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} style={cancelledStyle}>
                    <td
                      onClick={() => {
                        if (!isPrfCancelled) {
                          setIsModalOpen(true)
                          setSelectedRowIndex(index)
                        }
                      }}
                      style={{ cursor: isPrfCancelled ? "default" : "pointer" }}
                    >
                      <input type="text" name="stockCode" value={row.stockCode} readOnly style={cancelledStyle} />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="quantity"
                        value={row.quantity}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled}
                        style={cancelledStyle}
                      />
                    </td>
                    <td
                      onClick={() => {
                        if (!isPrfCancelled) {
                          setIsUomModalOpen(true)
                          setSelectedUomRowIndex(index)
                        }
                      }}
                      style={{ cursor: isPrfCancelled ? "default" : "pointer" }}
                    >
                      <input
                        type="text"
                        name="unit"
                        value={row.unit}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled}
                        style={cancelledStyle}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="description"
                        value={row.description}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled}
                        style={cancelledStyle}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="dateNeeded"
                        value={row.dateNeeded}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled}
                        style={cancelledStyle}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="purpose"
                        value={row.purpose}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled}
                        style={cancelledStyle}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-button-container">
            
            <AddRowButton onClick={handleAddRow} disabled={isPrfCancelled} />
            
            <CancelButton 
              onClick={() => handleCancel()} 
              disabled={isPrfCancelled} 
              label={cancelButtonLabel} 
            />
            
            {isUpdating ? (
              <UpdateButton onClick={handleUpdate} disabled={isPrfCancelled} />
            ) : (
              <SaveButton onClick={handleSave} />
            )}
          </div>

          {isModalOpen && <StockcodeModal onClose={() => setIsModalOpen(false)} onSelectStock={handleStockSelect} />}
          {isUomModalOpen && (
            <UomModal
              onClose={() => setIsUomModalOpen(false)}
              onSelectUom={handleUomSelect}
              stockId={rows[selectedUomRowIndex]?.stockId} // Pass the stockId from the selected row
            />
          )}

          <div className="approval-section">
            <div className="approval-box">
              <h3>Prepared By:</h3>
              <div className="signature-box">{fullname}</div>{" "}
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Checked By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Approved By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Received By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">Date / Time / Signature</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        input:read-only {
          background-color: ${isPrfCancelled ? "rgba(255, 0, 0, 0.05)" : "inherit"};
        }
      `}</style>
    </>
  )
}

export default NutraTechForm