"use client"
import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
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
import { CancelButton, AddRowButton, UncancelButton } from "../components/button"
import { savePrfDetails, updatePrfDetails, cancelPrf, uncancelPrf } from "../components/button-function"
import axios from "axios"

const NutraTechForm = () => {
  // State variables
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
  const [prfDate, setPrfDate] = useState(null) // Store the PRF date
  const [isSameDay, setIsSameDay] = useState(true) // Track if PRF date is the same as current date
  const [globalPurpose, setGlobalPurpose] = useState("")
  const fullname = localStorage.getItem("userFullname") || "" // Retrieve fullname
  const department = localStorage.getItem("userDepartment") || "" // Retrieve department
  const [isUomModalOpen, setIsUomModalOpen] = useState(false)
  const [selectedUomRowIndex, setSelectedUomRowIndex] = useState(null)

  const location = useLocation() // binabasa nito yung data (prfId) na galing sa Proceed button router
  const [preparedBy, setPreparedBy] = useState("") // sino nag preapre ng prf
  const [isCancel, setIsCancel] = useState(false) // kapag ang prf ay cancelled
  const [prfDetails, setPrfDetails] = useState([]) // list ng prf items from PRFTABLE_DETAILS
  const [loading, setLoading] = useState(false)

  const [hasEmailLinkApprovals, setHasEmailLinkApprovals] = useState(false);
  const [shouldFetchApprovals, setShouldFetchApprovals] = useState(false)   // Track if we should fetch approval settings
  
  const [approvalNames, setApprovalNames] = useState(() => {
    // First, check if location.state has approval data from Outlook email link
    if (location.state && (location.state.checkedBy || location.state.approvedBy || location.state.receivedBy)) {
      const approvalData = {
        checkedByUser: location.state.checkedBy || "",
        approvedByUser: location.state.approvedBy || "",
        receivedByUser: location.state.receivedBy || "",
      };
      console.log("[v0] Using approval data from location.state:", approvalData);
      return approvalData;
    }

    // check localStorage - after mag login ni user dito nag store 
    const storedCheckedBy = localStorage.getItem("checkedByUser") || "";
    const storedApprovedBy = localStorage.getItem("approvedByUser") || "";
    const storedReceivedBy = localStorage.getItem("receivedByUser") || "";
    
    const approvalData = {
      checkedByUser: storedCheckedBy,
      approvedByUser: storedApprovedBy,
      receivedByUser: storedReceivedBy,
    };
    return approvalData;
  });

  const [isOutlookView, setIsOutlookView] = useState(
    location.state && (location.state.checkedBy || location.state.approvedBy || location.state.receivedBy) ? true : false
  );

  const [shouldPreserveEmailApprovals, setShouldPreserveEmailApprovals] = useState(false);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => ({
      stockCode: "",
      quantity: "",
      unit: "",
      description: "",
      dateNeeded: getCurrentDate(),
      purpose: "",
      stockId: "",
    })),
  )

  // Format ng Date pag nag display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    }
    return dateString
  }

  // Convert date from YYYY-MM-DD to MM/DD/YYYY for backward compatibility
  const convertToMMDDYYYY = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    }
    return dateString
  }

  // Convert date from MM/DD/YYYY to YYYY-MM-DD
  const convertFromMMDDYYYY = (dateString) => {
    if (!dateString) return ""
    const parts = dateString.split("/")
    if (parts.length === 3) {
      const [month, day, year] = parts
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
    return dateString
  }

  const fetchPrfData = async (prfId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/prf/${prfId}`)
      const data = await response.json()

      if (response.ok) {
        // Dito nag sstore yung data at nag didisplay ng prf header
        setPurchaseCodeNumber(data.header.prfNo)
        setPrfDate(data.header.prfDate)
        setPreparedBy(data.header.preparedBy)
        setIsCancel(data.header.isCancel)

        if (data.details && Array.isArray(data.details)) {
          const newRows = data.details.map((detail) => ({
            stockCode: detail.StockCode || "",
            quantity: detail.quantity ? detail.quantity.toString() : "",
            unit: detail.unit || "",
            description: detail.StockName || detail.Description || "",
            dateNeeded: detail.DateNeeded ? convertFromMMDDYYYY(detail.DateNeeded) : getCurrentDate(),
            purpose: detail.Purpose || "",
            stockId: detail.Id || detail.StockCode || "",
          }))

          // Ensure we have at least 5 rows
          while (newRows.length < 5) {
            newRows.push({
              stockCode: "",
              quantity: "",
              unit: "",
              description: "",
              dateNeeded: getCurrentDate(),
              purpose: "",
              stockId: "",
            })
          }

          setRows(newRows)
        }

        // naguupdate para lumabas yung prf details sa table
        setPrfDetails(data.details)

        if (data.approvalNames && !hasEmailLinkApprovals) {
          setApprovalNames({
            checkedByUser: data.approvalNames.checkedByUser || "",
            approvedByUser: data.approvalNames.approvedByUser || "",
            receivedByUser: data.approvalNames.receivedByUser || "",
          });
          
          // Also store to localStorage for persistence
          localStorage.setItem("checkedByUser", data.approvalNames.checkedByUser || "");
          localStorage.setItem("approvedByUser", data.approvalNames.approvedByUser || "");
          localStorage.setItem("receivedByUser", data.approvalNames.receivedByUser || "");
        }

        setIsUpdating(true)
      } else {
        console.error("Failed to fetch PRF data:", data.message)
      }
    } catch (error) {
      console.error("Error fetching PRF data:", error)
    } finally {
      setLoading(false)
    }
  }

  // nag rurun kapag nag load ng ang page
  // dito nagcause ng loop sa console
  useEffect(() => {
    // chinecheck yung route galing sa Proceed button
    if (location.state && location.state.prfId && fetchPrfData) {
      const wrappedFetch = async (id) => {
        try {
          const response = await fetch(`http://localhost:5000/api/prf/${id}`);
          const data = await response.json();
          
          if (response.ok && data.approvalNames && !hasEmailLinkApprovals) {
            // Set approval names from API
            setApprovalNames({
              checkedByUser: data.approvalNames.checkedByUser || "",
              approvedByUser: data.approvalNames.approvedByUser || "",
              receivedByUser: data.approvalNames.receivedByUser || "",
            });
            // Store to localStorage
            localStorage.setItem("checkedByUser", data.approvalNames.checkedByUser || "");
            localStorage.setItem("approvedByUser", data.approvalNames.approvedByUser || "");
            localStorage.setItem("receivedByUser", data.approvalNames.receivedByUser || "");
          }
        } catch (error) {
          console.error("Error fetching approval names:", error);
        }
        
        // Still call the original fetchPrfData
        if (fetchPrfData) {
          fetchPrfData(id);
        }
      };
      
      wrappedFetch(location.state.prfId);
    }

    if (location.state && (location.state.checkedBy || location.state.approvedBy || location.state.receivedBy)) {
      const approvalData = {
        checkedByUser: location.state.checkedBy || "",
        approvedByUser: location.state.approvedBy || "",
        receivedByUser: location.state.receivedBy || "",
      };

      // Update state to ensure re-render
      setApprovalNames(approvalData);
      setHasEmailLinkApprovals(true);
      setShouldPreserveEmailApprovals(true);

      // Store to localStorage for persistence
      localStorage.setItem("checkedByUser", approvalData.checkedByUser);
      localStorage.setItem("approvedByUser", approvalData.approvedByUser);
      localStorage.setItem("receivedByUser", approvalData.receivedByUser);
    } else if (!hasEmailLinkApprovals) {
      const storedCheckedBy = localStorage.getItem("checkedByUser") || "";
      const storedApprovedBy = localStorage.getItem("approvedByUser") || "";
      const storedReceivedBy = localStorage.getItem("receivedByUser") || "";
      
      if (storedCheckedBy || storedApprovedBy || storedReceivedBy) {
        setApprovalNames({
          checkedByUser: storedCheckedBy,
          approvedByUser: storedApprovedBy,
          receivedByUser: storedReceivedBy,
        });
      }
    }

    if (!prfId) {
      const pending = localStorage.getItem("pendingPRF");
      if (pending && fetchPrfData) {
        const parsed = JSON.parse(pending);
        if (parsed.prfId) {
          fetchPrfData(parsed.prfId);
        }
      }
    }
  }, [location.state, hasEmailLinkApprovals]);

  // fetch approval settings when explicitly needed
  useEffect(() => {
    const fetchApprovalSettings = async () => {
      // Skip if we already have email link approvals
      if (hasEmailLinkApprovals) {
        return;
      }

      // Only fetch if we should fetch approvals AND we're updating an existing PRF
      if (!shouldFetchApprovals || !isUpdating) return;

      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/approvals/user/${userId}`);

        if (response.data.data && response.data.data.length > 0) {
          const approval = response.data.data[0];

          const fetchEmployeeNames = async (ids) => {
            const names = {};

            for (const [key, id] of Object.entries(ids)) {
              if (id) {
                try {
                  const empResponse = await axios.get(`http://localhost:5000/api/employee/${id}`);
                  if (empResponse.data && empResponse.data.FullName) {
                    names[key] = empResponse.data.FullName;
                  }
                } catch (error) {
                  console.error(`Error fetching employee for ${key}:`, error);
                }
              }
            }

            return names;
          };

          const employeeNames = await fetchEmployeeNames({
            checkedByUser: approval.CheckedById,
            approvedByUser: approval.ApprovedById,
            receivedByUser: approval.ReceivedById,
          });

          // Only update if we have names and we're still in update mode
          if (
            isUpdating &&
            (employeeNames.checkedByUser || employeeNames.approvedByUser || employeeNames.receivedByUser)
          ) {
            setApprovalNames({
              checkedByUser: employeeNames.checkedByUser || "",
              approvedByUser: employeeNames.approvedByUser || "",
              receivedByUser: employeeNames.receivedByUser || "",
            });

            // Update localStorage
            if (employeeNames.checkedByUser) localStorage.setItem("checkedByUser", employeeNames.checkedByUser);
            if (employeeNames.approvedByUser) localStorage.setItem("approvedByUser", employeeNames.approvedByUser);
            if (employeeNames.receivedByUser) localStorage.setItem("receivedByUser", employeeNames.receivedByUser);
          }
        }
      } catch (error) {
        console.error("Error fetching approval settings:", error);
      }
    };

    fetchApprovalSettings();
  }, [shouldFetchApprovals, isUpdating, hasEmailLinkApprovals]);

  // Listen for approval settings updates
  useEffect(() => {
    const handleApprovalSettingsUpdated = (event) => {
      if (event.detail) {
        const updatedNames = {
          checkedByUser: event.detail.checkedByUser || "",
          approvedByUser: event.detail.approvedByUser || "",
          receivedByUser: event.detail.receivedByUser || "",
        };

        // Only update if we have actual values OR we don't have email link approvals
        if (
          (updatedNames.checkedByUser || updatedNames.approvedByUser || updatedNames.receivedByUser) &&
          !hasEmailLinkApprovals
        ) {
          setApprovalNames(updatedNames);
          console.log("[v0] Approval settings updated from modal:", updatedNames);

          // If we're setting approval names from the modal, enable fetching for future loads
          if (updatedNames.checkedByUser || updatedNames.approvedByUser || updatedNames.receivedByUser) {
            setShouldFetchApprovals(true);
          }
        } else if (!hasEmailLinkApprovals) {
          // Only clear if we don't have email link approvals
          setApprovalNames(updatedNames);
        } else {
        }
      }
    };

    window.addEventListener("approvalSettingsUpdated", handleApprovalSettingsUpdated);

    return () => {
      window.removeEventListener("approvalSettingsUpdated", handleApprovalSettingsUpdated);
    };
  }, [hasEmailLinkApprovals]);


  //  Dispatch PRF ID updates to the layout
  useEffect(() => {
    if (prfId) {
      window.dispatchEvent(
        new CustomEvent("prfIdUpdated", {
          detail: { prfId },
        }),
      )
    }
  }, [prfId])

  // Check if a date is the same as today
  const checkIsSameDay = (dateToCheck) => {
    if (!dateToCheck) return false

    const today = new Date()
    const checkDate = new Date(dateToCheck)

    return (
      checkDate.getFullYear() === today.getFullYear() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getDate() === today.getDate()
    )
  }

  // Refresh PRF data
  const refreshPrfData = async () => {
    if (!prfId || !purchaseCodeNumber) return

    try {
      // console.log("Refreshing PRF data for:", { prfId, purchaseCodeNumber })
      const response = await fetch(
        `http://localhost:5000/api/search-prf?prfNo=${encodeURIComponent(purchaseCodeNumber)}`,
      )
      if (response.ok) {
        const data = await response.json()
        if (data.found) {
          // Get PRF date
          const prfDateObj = new Date(data.header.prfDate)
          setPrfDate(prfDateObj)
          // Check if PRF date is today
          const sameDay = checkIsSameDay(prfDateObj)
          setIsSameDay(sameDay)
          // Check if PRF is cancelled in the database
          const isDbCancelled =
            (data.header && data.header.prfIsCancel === 1) ||
            (data.header && data.header.isCancel === 1) ||
            data.isCancel === 1
          console.log("Database cancel status:", isDbCancelled)

          // A PRF is considered cancelled ONLY if it's marked as cancelled in the database
          const isCancelled = isDbCancelled

          setIsPrfCancelled(isCancelled)

          if (isDbCancelled) {
            setCancelButtonLabel("Cancelled")
          } else {
            setCancelButtonLabel("Cancel")
          }

          console.log("Updated state after refresh:", {
            sameDay,
            isDbCancelled,
            isCancelled,
            isPrfCancelled: isCancelled,
          })
        }
      }
    } catch (error) {
      console.error("Error refreshing PRF data:", error)
    }
  }

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

  // Listen for search results from App-layout.jsx
  useEffect(() => {
    const handleSearchResults = () => {
      const searchResultsStr = sessionStorage.getItem("prfSearchResults")
      if (searchResultsStr) {
        const data = JSON.parse(searchResultsStr)

        // Set the PRF header information
        setPurchaseCodeNumber(data.header.prfNo)
        setCurrentDate(data.header.prfDate.split("T")[0])
        setPrfId(data.header.prfId)

        // Get PRF date
        const prfDateObj = new Date(data.header.prfDate)
        setPrfDate(prfDateObj)

        // Check if PRF date is today
        const sameDay = checkIsSameDay(prfDateObj)
        setIsSameDay(sameDay)

        // Check if the PRF is cancelled from the response
        const isDbCancelled = data.header.prfIsCancel === 1 || data.isCancel === 1
        const isCancelled = isDbCancelled

        setIsPrfCancelled(isCancelled)

        // Set the cancel button label
        if (isDbCancelled) {
          setCancelButtonLabel("Cancelled")
        } else {
          setCancelButtonLabel("Cancel")
        }

        console.log("Search results - Button visibility:", {
          sameDay,
          isDbCancelled,
          isCancelled,
        })

        // Set the PRF details in the table
        const newRows = data.details.map((detail) => ({
          stockCode: detail.StockCode,
          quantity: detail.quantity ? detail.quantity.toString() : "",
          unit: detail.unit,
          description: detail.StockName || detail.description,
          dateNeeded: detail.dateNeeded ? convertFromMMDDYYYY(detail.dateNeeded) : getCurrentDate(),
          purpose: detail.purpose,
          stockId: detail.stockId || detail.StockCode || "",
        }))

        while (newRows.length < 5) {
          newRows.push({
            stockCode: "",
            quantity: "",
            unit: "",
            description: "",
            dateNeeded: getCurrentDate(),
            purpose: "",
            stockId: "",
          })
        }

        setRows(newRows)
        setIsUpdating(true)
        setShouldFetchApprovals(true) // Enable fetching approvals for existing PRF

        // Set approval names from search results if available
        if (data.approvalNames && !hasEmailLinkApprovals) {
          setApprovalNames({
            checkedByUser: data.approvalNames.checkedByUser || "",
            approvedByUser: data.approvalNames.approvedByUser || "",
            receivedByUser: data.approvalNames.receivedByUser || "",
          })

          localStorage.setItem("checkedByUser", data.approvalNames.checkedByUser || "")
          localStorage.setItem("approvedByUser", data.approvalNames.approvedByUser || "")
          localStorage.setItem("receivedByUser", data.approvalNames.receivedByUser || "")
        }

        sessionStorage.removeItem("prfSearchResults")
      }
    }

    // Create new form
    const handleNewForm = () => {
      const today = new Date()
      setCurrentDate(today.toISOString().split("T")[0])
      setPrfId(null)
      setPrfDate(today)
      setIsUpdating(false)
      setIsPrfCancelled(false)
      setCancelButtonLabel("Cancel")
      setIsSameDay(true)
      setShouldFetchApprovals(false) // Disable fetching approvals for new PRF

      // Generate a new purchase code
      generatePurchaseCode(company)

      // Reset rows to empty state with current date as default
      setRows(
        Array.from({ length: 5 }, () => ({
          stockCode: "",
          quantity: "",
          unit: "",
          description: "",
          dateNeeded: getCurrentDate(),
          purpose: "",
          stockId: "",
        })),
      )

      // Clear approval names for new form
      setApprovalNames({
        checkedByUser: "",
        approvedByUser: "",
        receivedByUser: "",
      })
      // Clear the flag for email link approvals on new form
      setHasEmailLinkApprovals(false)
      setShouldPreserveEmailApprovals(false)
    }

    // Check for existing search results when component mounts
    handleSearchResults()

    // Listen for future search events and new form events
    window.addEventListener("prfSearchCompleted", handleSearchResults)
    window.addEventListener("prfNewForm", handleNewForm)

    return () => {
      window.removeEventListener("prfSearchCompleted", handleSearchResults)
      window.removeEventListener("prfNewForm", handleNewForm)
    }
  }, [company, hasEmailLinkApprovals])

  // Add a focus/visibility event listener to refresh data when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && prfId && purchaseCodeNumber) {
        refreshPrfData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    if (prfId && purchaseCodeNumber) {
      refreshPrfData()
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [prfId, purchaseCodeNumber])

 
  // Sync globalPurpose when rows are loaded from search results
  useEffect(() => {
    const firstPurpose = rows.find((row) => row.purpose)?.purpose || ""
    if (firstPurpose && !globalPurpose) {
      // If we have purpose data in rows but no globalPurpose set, sync it
      setGlobalPurpose(firstPurpose)
    }
  }, [rows, globalPurpose])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null)

  // Function to handle stock selection
  const handleStockSelect = (stock) => {
    if (selectedRowIndex !== null) {
      console.log("Selected stock:", stock)
      console.log("Stock Id:", stock.Id)

      const newRows = [...rows]
      newRows[selectedRowIndex].stockCode = stock.StockCode
      newRows[selectedRowIndex].unit = stock.BaseUOM
      newRows[selectedRowIndex].description = stock.StockName
      newRows[selectedRowIndex].stockId = stock.Id
      // Set current date when stock is selected
      newRows[selectedRowIndex].dateNeeded = getCurrentDate()
      // Set purpose from global purpose when stock is selected
      newRows[selectedRowIndex].purpose = globalPurpose
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
      // Updated validation for integers AND decimals
      if (/^\d*\.?\d*$/.test(value)) {
        newRows[index][name] = value
        setRows(newRows)
      } else {
        alert("Please enter a valid number for quantity.")
      }
    } else if (name === "dateNeeded") {
      // Only handle date input change if there's a stockCode
      if (newRows[index].stockCode) {
        newRows[index][name] = value
        setRows(newRows)
      }
    } else {
      // Handle all other fields including purpose
      newRows[index][name] = value
      setRows(newRows)
    }
  }

  const handleDateChange = (event) => {
    setCurrentDate(event.target.value)
  }

  // Generate a unique purchase code based on company name
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

  // Save PRF Header
  const handleSavePrfHeader = async () => {
    if (!purchaseCodeNumber || !currentDate || !fullname) {
      console.error("Missing required data for PRF header")
      return null
    }

    const departmentId = localStorage.getItem("userDepartmentId")

    // saving prf header data details
    const prfHeaderData = {
      departmentId: departmentId,
      prfNo: purchaseCodeNumber,
      prfDate: currentDate,
      preparedBy: fullname,
      checkedBy: approvalNames.checkedByUser,
      approvedByUser: approvalNames.approvedByUser,
      receivedByUser: approvalNames.receivedByUser,
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
        setPrfDate(new Date(currentDate)) // Store the PRF date
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
    // First check if approval settings are configured
    if (!approvalNames.checkedByUser || !approvalNames.approvedByUser || !approvalNames.receivedByUser) {
      alert("Please fill out approval box first. Click on the approval setting to set up the required approvers.")
      return
    }

    // Check if there are any rows with stock codes
    const validRows = rows.filter((row) => row.stockCode && row.stockCode.trim())
    if (validRows.length === 0) {
      alert("Please fill out PRF details first before saving")
      return
    }

    // Check if any row with a stock code has an empty purpose field
    const hasEmptyPurpose = rows.some((row) => row.stockCode && !row.purpose.trim())

    if (hasEmptyPurpose) {
      alert("Purpose of Requisition is required for all items")
      // Highlight the empty purpose fields
      const purposeInputs = document.querySelectorAll('input[name="purpose"]')
      rows.forEach((row, index) => {
        if (row.stockCode && !row.purpose.trim()) {
          purposeInputs[index].style.border = "1px solid red"
          purposeInputs[index].placeholder = "Required field"
        }
      })
      return
    }

    let headerPrfId = prfId

    if (!headerPrfId) {
      headerPrfId = await handleSavePrfHeader()
    }

    // Convert dates back to MM/DD/YYYY format for backend compatibility
    const rowsWithConvertedDates = rows.map((row) => ({
      ...row,
      dateNeeded: row.dateNeeded ? convertToMMDDYYYY(row.dateNeeded) : "",
    }))

    const success = await savePrfDetails(headerPrfId, rowsWithConvertedDates)
    if (success) {
      setPrfId(headerPrfId)
    }
  }

  // Function to Update PRF details
  const handleUpdate = async () => {
    // Convert dates back to MM/DD/YYYY format for backend compatibility
    const rowsWithConvertedDates = rows.map((row) => ({
      ...row,
      dateNeeded: row.dateNeeded ? convertToMMDDYYYY(row.dateNeeded) : "",
    }))

    const success = await updatePrfDetails(prfId, rowsWithConvertedDates)
    if (success) {
      setIsUpdating(false)
    }
  }

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        stockCode: "",
        quantity: "",
        unit: "",
        description: "",
        dateNeeded: getCurrentDate(),
        purpose: globalPurpose, // Use the global purpose for new rows
        stockId: "",
      },
    ])
  }

  // Cancel PRF
  const handleCancel = async () => {
    // Don't allow cancellation if not on the same day
    if (!isSameDay || isPrfCancelled) {
      alert("PRF can only be cancelled on the same day it was created")
      return
    }

    const result = await cancelPrf(prfId)
    if (result && result.success) {
      // Update the button label
      setCancelButtonLabel("Cancelled")
      // Update the cancelled state - make sure this is set to true
      setIsPrfCancelled(true)

      console.log("PRF cancelled successfully, updating state:", {
        isPrfCancelled: true,
        isSameDay,
      })

      try {
        const verifyResponse = await axios.get(
          `http://localhost:5000/api/search-prf?prfNo=${encodeURIComponent(purchaseCodeNumber)}`,
        )

        if (verifyResponse.data && verifyResponse.data.found) {
          const isDbCancelled =
            (verifyResponse.data.header && verifyResponse.data.header.prfIsCancel === 1) ||
            verifyResponse.data.isCancel === 1

          console.log("Verification of cancel status:", isDbCancelled)

          if (!isDbCancelled) {
            alert(
              "Warning: The PRF may not have been properly cancelled in the database. Please try again or contact support.",
            )
          }
        }
      } catch (error) {
        console.error("Error verifying cancellation:", error)
      }
    }
  }

  // Uncancel PRF
  const handleUncancel = async () => {
    // Don't allow uncancellation if not on the same day
    if (!isSameDay) {
      alert("PRF can only be uncancelled on the same day it was created")
      return
    }

    console.log("Uncancelling PRF with ID:", prfId)
    console.log("Current state before uncancel:", { isPrfCancelled, isSameDay })

    // First verify if the PRF is actually cancelled in the database
    try {
      const verifyResponse = await axios.get(
        `http://localhost:5000/api/search-prf?prfNo=${encodeURIComponent(purchaseCodeNumber)}`,
      )

      if (verifyResponse.data && verifyResponse.data.found) {
        const isDbCancelled =
          (verifyResponse.data.header && verifyResponse.data.header.prfIsCancel === 1) ||
          verifyResponse.data.isCancel === 1

        console.log("Verification of cancel status before uncancel:", isDbCancelled)

        if (!isDbCancelled) {
          alert("This PRF is not marked as cancelled in the database. Refreshing data...")
          refreshPrfData()
          return
        }
      }
    } catch (error) {}

    const result = await uncancelPrf(prfId)
    console.log("Uncancel result:", result)

    if (result) {
      if (result.success) {
        // Update the button label
        setCancelButtonLabel("Cancel")

        // Update the cancelled state
        setIsPrfCancelled(false)

        console.log("PRF uncancelled successfully, updating state:", {
          isPrfCancelled: false,
          isSameDay,
        })
        setTimeout(() => {
          refreshPrfData()
        }, 1000)
      } else if (result.needsRefresh) {
        refreshPrfData()
      }
    }
  }

  const cancelledStyle = {
    color: isPrfCancelled ? "red" : "inherit",
  }

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("prfFormStateChanged", {
        detail: {
          isUpdating,
          isPrfCancelled,
          isSameDay,
          prfId,
          hasEmailLinkApprovals,
          shouldPreserveEmailApprovals,
        },
      }),
    )
  }, [isUpdating, isPrfCancelled, isSameDay, prfId, hasEmailLinkApprovals, shouldPreserveEmailApprovals])

  useEffect(() => {
    const handleSaveClick = async () => {
      // First check if approval settings are configured
      if (!approvalNames.checkedByUser || !approvalNames.approvedByUser || !approvalNames.receivedByUser) {
        alert("Please fill out approval box first. Click on the approval setting to set up the required approvers.")
        return
      }

      const validRows = rows.filter((row) => row.stockCode && row.stockCode.trim())
      if (validRows.length === 0) {
        alert("Please fill out PRF details first before saving")
        return
      }

      let headerPrfId = prfId

      if (!headerPrfId) {
        headerPrfId = await handleSavePrfHeader()
      }

      if (headerPrfId) {
        // Convert dates back to MM/DD/YYYY format for backend compatibility
        const rowsWithConvertedDates = rows.map((row) => ({
          ...row,
          dateNeeded: row.dateNeeded ? convertToMMDDYYYY(row.dateNeeded) : "",
        }))

        const success = await savePrfDetails(headerPrfId, rowsWithConvertedDates)
        if (success) {
          setPrfId(headerPrfId)
        }
      } else {
        console.error("Failed to save PRF header")
      }
    }

    const handleUpdateClick = async () => {
      console.log("Update clicked")

      const hasEmptyPurpose = rows.some((row) => row.stockCode && !row.purpose.trim())

      if (hasEmptyPurpose) {
        alert("Purpose of Requisition is required for all items")
        const purposeInputs = document.querySelectorAll('input[name="purpose"]')
        rows.forEach((row, index) => {
          if (row.stockCode && !row.purpose.trim()) {
            purposeInputs[index].style.border = "1px solid red"
            purposeInputs[index].placeholder = "Required field"
          }
        })
        return
      }

      // Convert dates back to MM/DD/YYYY format for backend compatibility
      const rowsWithConvertedDates = rows.map((row) => ({
        ...row,
        dateNeeded: row.dateNeeded ? convertToMMDDYYYY(row.dateNeeded) : "",
      }))

      const success = await updatePrfDetails(prfId, rowsWithConvertedDates)
      if (success) {
        setIsUpdating(false)
      }
    }

    window.addEventListener("prfSaveClicked", handleSaveClick)
    window.addEventListener("prfUpdateClicked", handleUpdateClick)

    return () => {
      window.removeEventListener("prfSaveClicked", handleSaveClick)
      window.removeEventListener("prfUpdateClicked", handleUpdateClick)
    }
  }, [rows, prfId, purchaseCodeNumber, currentDate, fullname, approvalNames])

  // Check if buttons should be shown based on same day check
  const showActionButtons = isSameDay && isUpdating

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
              <label style={{ color: isPrfCancelled ? "red" : "inherit" }}>No. {purchaseCodeNumber}</label>
            </div>
            <h1 className="header-one-label">PURCHASE REQUEST FORM</h1>
          </div>

          <div className="field-box">
            <div className="search-input-container-type">
              <label className="nutra-header-dept-label" htmlFor="department">
                Department (charge to):
              </label>
              <input type="text" id="department" className="department-type" value={department} readOnly />
            </div>

            <div className="nutra-date-container">
              <label className="nutra-date-label">Date:</label>
              <input
                type="date"
                id="date"
                className="input-date-nutra"
                value={currentDate}
                onChange={handleDateChange}
                required
              />
            </div>
          </div>

          <div className="field-box">
            <label className="project-label">Project Code:</label>
            <input type="text" className="project-code-input" readOnly />
          </div>

          <div className="following-label">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <label>I would like to request the following :</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label
                  htmlFor="globalPurpose"
                  className="purpose-requi-label"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                >
                  Purpose of Requisition:
                </label>
                <input
                  type="text"
                  id="globalPurpose"
                  value={globalPurpose}
                  className="purpose-item-input"
                  onChange={(e) => {
                    setGlobalPurpose(e.target.value)
                    if (rows) {
                      const newRows = rows.map((row) => ({
                        ...row,
                        purpose: e.target.value,
                      }))
                      setRows(newRows)
                    }
                  }}
                  placeholder="Enter purpose for all items"
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  disabled={isPrfCancelled || !isSameDay}
                />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <label
                      onClick={() => {
                        if (!isPrfCancelled && isSameDay) {
                          setIsModalOpen(true)
                          setSelectedRowIndex(0)
                        }
                      }}
                      style={{ cursor: isPrfCancelled || !isSameDay ? "default" : "pointer" }}
                    >
                      STOCK CODE
                    </label>
                  </th>
                  <th>QUANTITY</th>
                  <th>
                    <label
                      onClick={() => {
                        if (!isPrfCancelled && isSameDay) {
                          setIsUomModalOpen(true)
                          setSelectedUomRowIndex(0)
                        }
                      }}
                      style={{ cursor: isPrfCancelled || !isSameDay ? "default" : "pointer" }}
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
                  <tr key={index}>
                    <td
                      onClick={() => {
                        if (!isPrfCancelled && isSameDay) {
                          setIsModalOpen(true)
                          setSelectedRowIndex(index)
                        }
                      }}
                      style={{ cursor: isPrfCancelled || !isSameDay ? "default" : "pointer" }}
                    >
                      <input
                        type="text"
                        name="stockCode"
                        value={row.stockCode}
                        readOnly
                        style={{ color: isPrfCancelled ? "red" : "inherit" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="quantity"
                        value={row.quantity}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled || !isSameDay}
                        style={{ color: isPrfCancelled ? "red" : "inherit" }}
                      />
                    </td>
                    <td
                      onClick={() => {
                        if (!isPrfCancelled && isSameDay) {
                          setIsUomModalOpen(true)
                          setSelectedUomRowIndex(index)
                        }
                      }}
                      style={{ cursor: isPrfCancelled || !isSameDay ? "default" : "pointer" }}
                    >
                      <input
                        type="text"
                        name="unit"
                        value={row.unit}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled || !isSameDay}
                        style={{ color: isPrfCancelled ? "red" : "inherit" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="description"
                        value={row.description}
                        onChange={(e) => handleInputChange(index, e)}
                        readOnly={isPrfCancelled || !isSameDay}
                        style={{ color: isPrfCancelled ? "red" : "inherit" }}
                      />
                    </td>
                    <td className="date-needed-cell">
                      {row.stockCode ? (
                        <div className="date-input-container">
                          <Calendar className="date-icon" />
                          <input
                            type="date"
                            name="dateNeeded"
                            value={row.dateNeeded}
                            onChange={(e) => handleInputChange(index, e)}
                            readOnly={isPrfCancelled || !isSameDay}
                            className="enhanced-date-input"
                            style={{ color: isPrfCancelled ? "red" : "inherit" }}
                          />
                          {row.dateNeeded && <div className="date-display">{formatDateForDisplay(row.dateNeeded)}</div>}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </td>
                    <td>
                      {row.stockCode ? (
                        <input
                          type="text"
                          name="purpose"
                          value={row.purpose}
                          onChange={(e) => handleInputChange(index, e)}
                          readOnly={isPrfCancelled || !isSameDay}
                          style={{
                            color: isPrfCancelled ? "red" : "inherit",
                            backgroundColor: isPrfCancelled || !isSameDay ? "#f8f9fa" : "white",
                            cursor: isPrfCancelled || !isSameDay ? "not-allowed" : "text",
                          }}
                          placeholder="Enter purpose"
                        />
                      ) : (
                        <div></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-button-container">
            <AddRowButton onClick={handleAddRow} disabled={isPrfCancelled || !isSameDay} />

            {showActionButtons && (
              <div className="action-buttons">
                <CancelButton
                  onClick={handleCancel}
                  disabled={isPrfCancelled || !isSameDay}
                  label={cancelButtonLabel}
                />
                <UncancelButton onClick={handleUncancel} disabled={!isPrfCancelled} label="Uncancel" />
              </div>
            )}
          </div>

          {isModalOpen && <StockcodeModal onClose={() => setIsModalOpen(false)} onSelectStock={handleStockSelect} />}
          {isUomModalOpen && (
            <UomModal
              onClose={() => setIsUomModalOpen(false)}
              onSelectUom={handleUomSelect}
              stockId={rows[selectedUomRowIndex]?.stockId || rows[selectedUomRowIndex]?.stockCode || "all"}
            />
          )}

          <div
            className="approval-section"
            onClick={() => {
              if (!approvalNames.checkedByUser || !approvalNames.approvedByUser || !approvalNames.receivedByUser) {
                // Open approval modal - you'll need to add this state and modal
                // For now, show an alert directing them to set up approvals
                alert(
                  "Click here to set up approval settings. You need to configure CheckedBy, ApprovedBy, and ReceivedBy users before saving the PRF.",
                );
              }
            }}
          >
            <div className="approval-box">
              <h3>Prepared By:</h3>
              <div className="signature-box">{fullname}</div>
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Checked By:</h3>
              <div className="signature-box">{approvalNames.checkedByUser}</div>
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Approved By:</h3>
              <div className="signature-box">{approvalNames.approvedByUser}</div>
              <p className="signature-label">Signature over printed Name / Date</p>
            </div>

            <div className="approval-box">
              <h3>Received By:</h3>
              <div className="signature-box">{approvalNames.receivedByUser}</div>
              <p className="signature-label">Date / Time / Signature</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
      
        /* Adjust other column widths to accommodate larger date column */
        :global(th:nth-child(1), td:nth-child(1)) { width: 12% !important; }  /* STOCK CODE */
        :global(th:nth-child(2), td:nth-child(2)) { width: 8% !important; }   /* QUANTITY */
        :global(th:nth-child(3), td:nth-child(3)) { width: 10% !important; }  /* UNIT */
        :global(th:nth-child(4), td:nth-child(4)) { width: 36% !important; }  /* DESCRIPTION */
        :global(th:nth-child(5), td:nth-child(5)) { width: 16% !important; }  /* DATE NEEDED */
        :global(th:nth-child(6), td:nth-child(6)) { width: 18% !important; }  /* PURPOSE */

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
