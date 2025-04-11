"use client";

import { useState, useEffect } from "react";
import "../styles/NutratechForm.css";
import userLogo from "../assets/user-icon.png";
import downloadLogo from "../assets/downloads.png";
import printLogo from "../assets/printing.png";
import { useLocation, useNavigate } from "react-router-dom";
import userSignout from "../assets/user-signout.png";

import NutraTechlogo from "../assets/NTBI.png";
import avliLogo from "../assets/AVLI.png";
import apthealthLogo from "../assets/apthealth inc full logo.png";

import nutraheaderlogo from "../assets/nutratechlogo.jpg";
import apthealtheaderLogo from "../assets/apthealth logo.png";
import avliheaderLogo from "../assets/avli biocare.logo.png";

import StockcodeModal from "./StockcodeModal";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import search from "../assets/search.png";
import axios from "axios";

const NutraTechForm = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [company, setCompany] = useState("NutraTech Biopharma, Inc"); // Default value
  const [purchaseCodeNumber, setPurchaseCodeNumber] = useState("");
  const [prfId, setPrfId] = useState(null) // Store the PRF ID
  const [searchInput, setSearchInput] = useState("")

  const [isUpdating, setIsUpdating] = useState(false) // Track if we're in update mode

  const fullname = localStorage.getItem("userFullname") || ""; // Retrieve fullname
  const department = localStorage.getItem("userDepartment") || ""; // Retrieve department
  
  useEffect(() => {
    if (location.state && location.state.company) {
      setCompany(location.state.company);
    } else {
      alert("No company selected. Please login again.");
      navigate("/login");
    }
  }, [location.state, navigate]);

  // Generate a unique purchase code when company changes
  useEffect(() => {
    if (company) {
      generatePurchaseCode(company);
    }
  }, [company]);

  
  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => ({
      stockCode: "",
      quantity: "",
      unit: "",
      description: "",
      dateNeeded: "",
      purpose: "",
    }))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Function to handle stock selection
  const handleStockSelect = (stock) => {
    if (selectedRowIndex !== null) {
      const newRows = [...rows];
      newRows[selectedRowIndex].stockCode = stock.StockCode;
      newRows[selectedRowIndex].unit = stock.BaseUOM;
      newRows[selectedRowIndex].description = stock.StockName;
      setRows(newRows);
    }
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newRows = [...rows];

    if (name === "quantity") {
      // Validation for integers 
      if (/^\d*$/.test(value)) {
        newRows[index][name] = value;
        setRows(newRows);
      } else {
        alert("Please enter a valid integer for quantity.");
      }
    } else if (name === "dateNeeded") {
      // Validation for MM/DD/YYYY format
      if (value.length === 10) {
        const datePattern =
          /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
        if (!datePattern.test(value)) {
          alert("Please enter a valid date in MM/DD/YYYY format.");
          return;
        }
      }
      newRows[index][name] = value;
      setRows(newRows);
    } else {
      newRows[index][name] = value;
      setRows(newRows);
    }
  };

  const handleDateChange = (event) => {
    setCurrentDate(event.target.value);
  };

  // Function to generate a unique purchase code based on company name
  const generatePurchaseCode = (companyName) => {
    // Map company names to their specific code letters
    const companyCodeMap = {
      "NutraTech Biopharma, Inc": "N",
      "Avli Biocare, Inc": "B",
      "Apthealth, Inc": "P",
    };

    // Get the correct letter for the company
    const codeLetter =
      companyCodeMap[companyName] || companyName.charAt(0).toUpperCase();

    // Generate 5 random digits
    const randomDigits = Math.floor(10000 + Math.random() * 90000);

    // Set the purchase code
    const newCode = `${codeLetter} ${randomDigits}`;
    setPurchaseCodeNumber(newCode);
  };


    // Function after generate PurchaseCode function
      const handleSavePrfHeader = async () => {
        if (!purchaseCodeNumber || !currentDate || !fullname) {
            console.error("Missing required data for PRF header");
            return null;
        }

        const departmentId = localStorage.getItem("userDepartmentId");

        const prfHeaderData = {
            departmentId: departmentId, 
            prfNo: purchaseCodeNumber,
            prfDate: currentDate,
            preparedBy: fullname,
        };

        try {
            const response = await fetch("http://localhost:5000/api/save-table-header", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prfHeaderData),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("PRF header saved:", data.prfId); // Get PRF ID from backend
                setPrfId(data.prfId); // Store the backend-generated PRF ID
                return data.prfId;  // Return PRF ID from backend
            } else {
                console.error("Error saving PRF header:", data.message);
                return null;
            }
        } catch (error) {
            console.error("Failed to save PRF header:", error);
            return null;
        }
    };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignout = () => {
    navigate("/login");
  };

  const headerLogos = {
    "NutraTech Biopharma, Inc": nutraheaderlogo,
    "Avli Biocare, Inc": avliheaderLogo,
    "Apthealth, Inc": apthealtheaderLogo,
  };

  const companyLogos = {
    "NutraTech Biopharma, Inc": NutraTechlogo,
    "Avli Biocare, Inc": avliLogo,
    "Apthealth, Inc": apthealthLogo,
  };

  const handleDownloadPDF = () => {
    const saveButton = document.querySelector(".save-button-container");
    if (saveButton) saveButton.style.display = "none"; // Hide button

    const input = document.querySelector(".form-box-container");
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Purchase_Request_Form.pdf");

      if (saveButton) saveButton.style.display = "flex"; // Show button again
    });
  };

    const handleSave = async () => {
      let headerPrfId = prfId

      if (!headerPrfId) {
        headerPrfId = await handleSavePrfHeader() // Save PRF header if not yet saved
      }
      if (!headerPrfId) {
        alert("Failed to save PRF header. Please try again.")
        return
      }

      const prfDetails = rows
        .filter((row) => row.stockCode) // Only save rows with selected stock
        .map((row) => ({
          prfId: headerPrfId,
          headerPrfId: headerPrfId, // Include the integer ID from the header table
          stockId: crypto.randomUUID(), // Generate unique Stock ID
          stockCode: row.stockCode,
          stockName: row.description, // Stock Name is in Description field
          uom: row.unit, // UOM is in Unit field
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
          body: JSON.stringify(prfDetails), // Send all selected stock rows
        })

        const data = await response.json()
        if (response.ok) {
          alert("Data saved successfully!")
        } else {
          alert("Error saving data: " + data.message)
        }
      } catch (error) {
        console.error("Error:", error)
        alert("Failed to save data.")
      }
    }

      // Function to handle updating PRF details
    const handleUpdate = async () => {
      if (!prfId) {
        alert("No PRF ID found. Please search for a PRF first.")
        return
      }

      const prfDetails = rows
        .filter((row) => row.stockCode) // Only update rows with selected stock
        .map((row) => ({
          prfId: prfId,
          stockCode: row.stockCode,
          stockName: row.description, // Stock Name is in Description field
          uom: row.unit, // UOM is in Unit field
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
          setIsUpdating(false) 
        } else {
          alert("Error updating PRF details: " + response.data.message)
        }
      } catch (error) {
        console.error("Error updating PRF details:", error)
        alert("Failed to update PRF details. Please try again.")
      }
    }


    const handleAddRow = () => {
        setRows([...rows, { stockCode: "", quantity: "", unit: "", description: "", dateNeeded: "", purpose: "" }]);
    };

    const handleSearchPrf = async () => {
      if (!searchInput.trim()) {
        alert("Please enter a PRF number to search")
        return
      }
  
      // Remove "No. " prefix if it exists
      let searchValue = searchInput.trim()
      if (searchValue.startsWith("No. ")) {
        searchValue = searchValue.substring(4)
      }
  
      console.log(`Searching for PRF number: ${searchValue}`)
  
      try {
        const response = await fetch(`http://localhost:5000/api/search-prf?prfNo=${searchValue}`)
        const data = await response.json()
  
        if (response.ok && data.found) {
          console.log("PRF found:", data)
  
          // Set the PRF header information
          setPurchaseCodeNumber(data.header.prfNo)
          setCurrentDate(data.header.prfDate.split("T")[0])
          setPrfId(data.header.prfId)
  
          // Set the PRF details in the table
          const newRows = data.details.map((detail) => ({
            stockCode: detail.StockCode,
            quantity: detail.quantity.toString(),
            unit: detail.unit,
            description: detail.StockName,
            dateNeeded: detail.dateNeeded,
            purpose: detail.purpose,
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
            })
          }
  
          setRows(newRows)
          setIsUpdating(true) // Set to update mode since we're loading existing data
  
          alert("PRF details loaded successfully!")
        } else {
          alert("PRF not found. Please check the PRF number and try again.")
        }
      } catch (error) {
        console.error("Error searching PRF:", error)
        alert("Failed to search PRF. Please try again later.")
      }
    }

    const handleCancel = async (prfId) => {
    
      if (!prfId) {
        alert("No PRF ID found. Please search for a PRF first.")
        return
      }
    
      // Confirm cancellation
      if (!window.confirm("Are you sure you want to cancel this PRF? This action cannot be undone.")) {
        return
      }
    
      try {
        const response = await axios.post("http://localhost:5000/api/cancel-prf", {
          prfId: prfId,
        })
    
        if (response.status === 200) {
          alert("PRF has been canceled successfully!")
          // Optionally navigate back to the list view
          // navigate("/nutraTech/form")
        } else {
          alert("Error canceling PRF: " + response.data.message)
        }
      } catch (error) {
        console.error("Error canceling PRF:", error)
        alert("Failed to cancel PRF. Please try again.")
      }
    }

  return (
    <>
      <div className="nav-bar-container">
        <div className="nav-bar-logo">
          <img
            src={headerLogos[company] || "/placeholder.svg"}
            alt="Company Logo"
          />
          <label className="nav-bar-label">{company}</label>
        </div>

        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search PRF No..."
              className="search-input-form"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="search-button" onClick={handleSearchPrf}>
              <img className="searchPrfNo" src={search || "/placeholder.svg"} alt="Search" />
            </button>
          </div>
        </div>

        <div className="nav-icons">
          <img
            src={printLogo || "/placeholder.svg"}
            alt="Print Logo"
            onClick={() => window.print()}
            className="print-icon"
          />
          <img
            src={downloadLogo || "/placeholder.svg"}
            alt="Download Logo"
            onClick={handleDownloadPDF}
            className="download-icon"
          />

          <div className="user-profile-container">
            <img
              src={userLogo || "/placeholder.svg"}
              alt="User Logo"
              onClick={toggleDropdown}
              className="user-icon"
            />
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="user-info">
                  <img
                    src={userSignout || "/placeholder.svg"}
                    alt="User Signout"
                    className="user-signout-icon"
                  />
                  <p className="dropdown-user-label">{fullname}</p>
                </div>
                <button className="signout-button" onClick={handleSignout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-container">
        <div className="form-box-container">
          <div className="header">
            <div>
              <div className="logo">
                <img
                  src={companyLogos[company] || "/placeholder.svg"}
                  alt="Company Logo"
                />
              </div>
              <h3 className="header-three">
                Brgy. Balubad II, Silang Cavite, Philippines
              </h3>
              <h3 className="header-four">
                Tels.: • (02) 579-0954 • (02) 986-0729 • (02) 925-9515
              </h3>
            </div>
          </div>

          <div className="form-header">
            <div className="purchase-code-number">
              <label>No. {purchaseCodeNumber}</label>
            </div>
            <h1 className="header-one-label">PURCHASE REQUEST FORM</h1>
          </div>

          <div className="field-box">
            <div className="input-container">
              <label className="header-dept-label" htmlFor="department">
                Department (charge to):
              </label>
              <input
                type="text"
                id="department"
                className="department-display"
                value={department}
                readOnly
              />
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
                        setIsModalOpen(true);
                        setSelectedRowIndex(0); // Default row selection
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      STOCK CODE
                    </label>
                  </th>
                  <th>QUANTITY</th>
                  <th>UNIT</th>
                  <th>DESCRIPTION</th>
                  <th>DATE NEEDED</th>
                  <th>PURPOSE OF REQUISITION</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td
                      onClick={() => {
                        setIsModalOpen(true);
                        setSelectedRowIndex(index);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="text"
                        name="stockCode"
                        value={row.stockCode}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="quantity"
                        value={row.quantity}
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="unit"
                        value={row.unit}
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="description"
                        value={row.description}
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="dateNeeded"
                        value={row.dateNeeded}
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="purpose"
                        value={row.purpose}
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-button-container">
            <button className="add-row-button" onClick={handleAddRow}>
              + Add Row
            </button>
            <button className="cancel-button" onClick={() => handleCancel(prfId)}>
              Cancel
            </button>
            {isUpdating ? (
              <button className="update-button" onClick={handleUpdate}>
                Update
              </button>
            ) : (
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
            )}
          </div>

          {isModalOpen && (
            <StockcodeModal
              onClose={() => setIsModalOpen(false)}
              onSelectStock={handleStockSelect}
            />
          )}
          <div className="approval-section">
            <div className="approval-box">
              <h3>Prepared By:</h3>
              <div className="signature-box">{fullname}</div>{" "}
              <p className="signature-label">
                Signature over printed Name / Date
              </p>
            </div>

            <div className="approval-box">
              <h3>Checked By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">
                Signature over printed Name / Date
              </p>
            </div>

            <div className="approval-box">
              <h3>Approved By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">
                Signature over printed Name / Date
              </p>
            </div>

            <div className="approval-box">
              <h3>Received By:</h3>
              <div className="signature-box"></div>
              <p className="signature-label">Date / Time / Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NutraTechForm;
