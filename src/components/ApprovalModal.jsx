"use client"
import { useState, useEffect, useRef } from "react"
import "../styles/ApprovalModal.css"
import axios from "axios"

const ApprovalModal = ({ onClose }) => {
  // Initial form state 
  const initialFormData = {
    checkedByUser: "",
    checkedByEmail: "",
    checkedByUserOid: null,
    approvedByUser: "",
    approvedByEmail: "",
    approvedByUserOid: null,
    receivedByUser: "Benjie L. Salvador",
    receivedByEmail: "",
    receivedByUserOid: null,
  }

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPrfId, setCurrentPrfId] = useState(null)
  const [currentPrfNo, setCurrentPrfNo] = useState("")
  const [formData, setFormData] = useState(initialFormData)

  // Get userId from localStorage
  const [currentUserId, setCurrentUserId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Initial search terms state
  const initialSearchTerms = {
    checkedByUser: "",
    approvedByUser: "",
    receivedByUser: "",
  }

  // states for custom dropdowns
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchTerms, setSearchTerms] = useState(initialSearchTerms)

  // refs for dropdown containers
  const dropdownRefs = {
    checkedByUser: useRef(null),
    approvedByUser: useRef(null),
    receivedByUser: useRef(null),
  }

  // refs for search inputs to maintain focus
  const searchInputRefs = {
    checkedByUser: useRef(null),
    approvedByUser: useRef(null),
    receivedByUser: useRef(null),
  }

  // prevent focus loss during typing
  const isTypingRef = useRef(false)

  // Function to reset all form fields
  const resetFormFields = () => {
    setFormData(initialFormData)
    setSearchTerms(initialSearchTerms)
    setOpenDropdown(null)
    setError(null)
    setSubmitting(false)
  }

  // kapag nag close mag rereset yung fields
  const handleClose = () => {
    resetFormFields()
    onClose()
  }

  // Initialize with empty form when modal opens
  useEffect(() => {
    resetFormFields()
  }, [])

  useEffect(() => {
    // Get userId from localStorage
    const userId = localStorage.getItem("userId")
    if (userId) {
      setCurrentUserId(Number(userId))
    }

    // Get PRF information from localStorage or other source
    const prfId = localStorage.getItem("currentPrfId")
    const prfNo = localStorage.getItem("currentPrfNo")

    if (prfId) setCurrentPrfId(prfId)
    if (prfNo) setCurrentPrfNo(prfNo)
  }, [])

  // Fetch employees from the AVLI SecuritySystemUser table
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/employees")
        if (!response.ok) {
          throw new Error("Failed to fetch employees")
        }
        const data = await response.json()
        setEmployees(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching employees:", error)
        setError("Failed to load employees. Please try again.")
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Get logged-in user data (stored at login)
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const departmentType = loggedUser?.departmentType

  // Assign Check and Approved by Department
  useEffect(() => {
    if (departmentType) {
      let defaultCheckedBy = ""
      let defaultApprovedBy = ""

      switch (departmentType) {
        case "Information Technology":
          defaultCheckedBy = "Arman A. Creencia"
          defaultApprovedBy = "Andrea Kathleen D. Castillo"
        break

        case "Production":
          defaultCheckedBy = ""
          defaultApprovedBy = "Michelle Anne C. Perez" // head
        break

        case "CGS":
          defaultCheckedBy = ""
          defaultApprovedBy = "Jocelyn D. Ferma" // head
        break

        case "CMD":
          defaultCheckedBy = ""
          defaultApprovedBy = "Glenn Villanueva" // head
        break

        case "Audit":
          defaultCheckedBy = ""
          defaultApprovedBy = "Carmilyn Berenguel" // head
        break

        case "Legal":
          defaultCheckedBy = ""
          defaultApprovedBy = " Jovie Hona" // head
        break

        case "Finance":
          defaultCheckedBy = ""
          defaultApprovedBy = "Jennifer June Cambongga" // head
        break

        case "Human Resource":
          defaultCheckedBy = ""
          defaultApprovedBy = "Jennifer June Cambongga" // head
        break

        case "Marketing":
          defaultCheckedBy = ""
          defaultApprovedBy = "Dave Rinson De Villa" // head
        break

        case "Regulatory":
          defaultCheckedBy = ""
          defaultApprovedBy = "Myra Bautista" // head
        break

        case "Purchasing":
          defaultCheckedBy = ""
          defaultApprovedBy = "Benjie Salvador" // head
        break

        case "WLO":
          defaultCheckedBy = ""
          defaultApprovedBy = "Kristina Remitar" // head
        break

        case "Engineering":
          defaultCheckedBy = ""
          defaultApprovedBy = "Henry Escoses" // head
        break

        case "Sales":
          defaultCheckedBy = ""
          defaultApprovedBy = "Referenda Lopez" // head
        break

        case "Corplan":
          defaultCheckedBy = ""
          defaultApprovedBy = "Dave Rinson De Villa" // head
        break

        // Add more departments as needed
        default:
          defaultCheckedBy = ""
          defaultApprovedBy = ""
      }

      // ✅ Set initial dropdown values
      setFormData((prev) => ({
        ...prev,
        checkedByUser: defaultCheckedBy,
        approvedByUser: defaultApprovedBy,
      }))
    }
  }, [departmentType])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !isTypingRef.current) {
        const ref = dropdownRefs[openDropdown]
        if (ref.current && !ref.current.contains(event.target)) {
          setOpenDropdown(null)
        }
      }
      isTypingRef.current = false
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openDropdown])

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (openDropdown && searchInputRefs[openDropdown]?.current) {
      setTimeout(() => {
        searchInputRefs[openDropdown].current?.focus()
      }, 10)
    }
  }, [openDropdown])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSearchChange = (e, field) => {
    const { value } = e.target
    // Set typing flag to prevent dropdown from closing
    isTypingRef.current = true

    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Make sure input stays focused after state update
    setTimeout(() => {
      if (searchInputRefs[field]?.current) {
        searchInputRefs[field].current.focus()
      }
    }, 0)
  }

  const handleSelectUser = (field, value, oid) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Store the OID for the selected user
      [field + "Oid"]: oid,
    }))
    setOpenDropdown(null)
    setSearchTerms((prev) => ({
      ...prev,
      [field]: "",
    }))
  }

  const toggleDropdown = (field) => {
    if (loading) return
    setOpenDropdown(openDropdown === field ? null : field)
    // Reset search term when opening dropdown
    if (openDropdown !== field) {
      setSearchTerms((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Filter employees based on search term
  const getFilteredEmployees = (field) => {
    const searchTerm = searchTerms[field].toLowerCase()
    if (!searchTerm) {
      return employees.slice(0, 5) // Show only 5 employees
    }
    return employees.filter((emp) => emp && emp.FullName && emp.FullName.toLowerCase().includes(searchTerm))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!currentUserId) {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setError("User ID not found. Please log in again.")
        setSubmitting(false)
        return
      }
      setCurrentUserId(Number(userId))
    }

    try {
      // Step 1: Check if record exists in AssignedApprovals
      const checkResponse = await axios.get(`http://localhost:5000/api/approvals/user/${currentUserId}`)
      const existingApproval = checkResponse.data.data?.[0]

      const approvalData = {
        UserID: currentUserId,
        ApplicType: "PRF",
        CheckedById: formData.checkedByUserOid,
        CheckedByEmail: formData.checkedByEmail || null,
        ApprovedById: formData.approvedByUserOid,
        ApprovedByEmail: formData.approvedByEmail || null,
        ReceivedById: formData.receivedByUserOid,
        ReceivedByEmail: formData.receivedByEmail || null,
        skipNotifications: true, // flag to indicate this is from ApprovalModal (no notifications should be sent)
      }

      let response
      let approvalId

      // Step 2: Create or update AssignedApprovals
      if (existingApproval) {
        approvalId = existingApproval.ApproverAssignID
        await axios.put(`http://localhost:5000/api/approvals/${approvalId}`, approvalData)
        console.log("✅ Approval record updated.")
      } else {
        const res = await axios.post("http://localhost:5000/api/approvals", approvalData)
        approvalId = res.data.data?.id
        console.log("✅ New approval record created.")
      }

      // Step 3: Populate correct OIDs in AssignedApprovals (NEW PART)
      await axios.post("http://localhost:5000/api/populate-approvals", {
        userId: currentUserId,
        checkedBy: formData.checkedByUser,
        approvedBy: formData.approvedByUser,
        receivedBy: formData.receivedByUser,
      })
      console.log("✅ AssignedApprovals OIDs populated successfully.")

      // Step 4: Update PRFTABLE with the selected names
      const currentPrfId = localStorage.getItem("currentPrfId")
      if (currentPrfId) {
        await axios.put("http://localhost:5000/api/prf/update-approvers", {
          prfId: currentPrfId,
          checkedBy: formData.checkedByUser,
          approvedBy: formData.approvedByUser,
          receivedBy: formData.receivedByUser,
        })
        console.log("✅ PRFTABLE updated with approver names.")
      }

      // Step 5: Save to localStorage for frontend use
      localStorage.setItem("checkedByUser", formData.checkedByUser)
      localStorage.setItem("approvedByUser", formData.approvedByUser)
      localStorage.setItem("receivedByUser", formData.receivedByUser)

      // Save email addresses to localStorage for later use when saving PRF
      localStorage.setItem("checkedByEmail", formData.checkedByEmail || "")
      localStorage.setItem("approvedByEmail", formData.approvedByEmail || "")
      localStorage.setItem("receivedByEmail", formData.receivedByEmail || "")

      window.dispatchEvent(
        new CustomEvent("approvalSettingsUpdated", {
          detail: {
            checkedByUser: formData.checkedByUser,
            approvedByUser: formData.approvedByUser,
            receivedByUser: formData.receivedByUser,
          },
        })
      )

      alert("✅ Approval details saved successfully!")
      setTimeout(() => {
        resetFormFields()
        onClose()
      }, 1000)
    } catch (error) {
      console.error("❌ Error saving approval settings:", error)
      setError(error.response?.data?.message || "Failed to save approval settings.")
    } finally {
      setSubmitting(false)
    }
  }

  const CustomDropdown = ({ field, label, className }) => {
    // Calculate z-index based on dropdown position and open state
    const getZIndex = () => {
      if (openDropdown === field) {
        return 10000 // Highest z-index for active dropdown
      }
      return 1000 // Base z-index for inactive dropdowns
    }

    return (
      <>
        <label htmlFor={field} className={field.includes("approved") ? "approvedby-form-label" : "form-label"}>
          {label}
        </label>

        <div
          ref={dropdownRefs[field]}
          className={`custom-dropdown-container ${openDropdown === field ? "dropdown-open" : ""}`}
          style={{
            position: "relative",
            zIndex: getZIndex(),
          }}
        >
          <div
            className={className}
            onClick={() => toggleDropdown(field)}
            style={{
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              backgroundColor: loading ? "#f5f5f5" : "white",
            }}
          >
            <span>{formData[field] || "Select user"}</span>
            <span
              style={{
                transform: openDropdown === field ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              ▼
            </span>
          </div>

          {openDropdown === field && !loading && (
            <div
              className="dropdown-menu"
              style={{
                position: "absolute",
                width: "100%",
                maxHeight: "250px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "2px",
                backgroundColor: "white",
                zIndex: 10001, 
                boxShadow: "0 8px 24px rgba(76, 175, 80, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <input
                ref={searchInputRefs[field]}
                type="text"
                value={searchTerms[field]}
                onChange={(e) => handleSearchChange(e, field)}
                onKeyDown={(e) => {
                  // Set typing flag to prevent dropdown from closing
                  isTypingRef.current = true
                }}
                onClick={(e) => {
                  // Prevent event propagation to avoid closing dropdown
                  e.stopPropagation()
                  isTypingRef.current = true
                }}
                placeholder="Search users..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  borderBottom: "1px solid #eee",
                }}
              />

              {getFilteredEmployees(field).length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {getFilteredEmployees(field).map((employee, index) => (
                    <li
                      key={employee.Oid}
                      onClick={() => handleSelectUser(field, employee.FullName, employee.Oid)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: index < getFilteredEmployees(field).length - 1 ? "1px solid #eee" : "none",
                        backgroundColor: formData[field] === employee.FullName ? "#f0f0f0" : "white",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = formData[field] === employee.FullName ? "#f0f0f0" : "white")
                      }
                    >
                      {employee.FullName}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: "8px 12px", color: "#999" }}>No users found</div>
              )}

              {!searchTerms[field] && employees.length > 5 && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderTop: "1px solid #eee",
                    color: "#666",
                    fontSize: "0.9em",
                    textAlign: "center",
                  }}
                >
                  {employees.length - 5} more users available. Type to search.
                </div>
              )}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal">
        <div className="approval-modal-header">
          <h2>Approval Settings</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", margin: "10px 0", padding: "10px", backgroundColor: "#ffeeee", borderRadius: "4px" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="approval-form">
          <div className="approval-sects">
            <div className="section-title">CheckedBy:</div>

            <div className="form-grid">
              <CustomDropdown field="checkedByUser" className="checkby-form-input" />

              <label htmlFor="checkedByEmail" className="checkby-form-label">
                {/*Email*/}
              </label>
              <input
                type="email"
                id="checkedByEmail"
                name="checkedByEmail"
                value={formData.checkedByEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="checkby-email-input"
              />
            </div>

          </div>

          <div className="approval-sects">
            <div className="section-title">ApprovedBy:</div>
            <div className="form-grid">
              <CustomDropdown field="approvedByUser" className="approvedby-form-input" />

              <label htmlFor="approvedByEmail" className="approvedby-form-label">
                {/*Email*/}
              </label>
              <input
                type="email"
                id="approvedByEmail"
                name="approvedByEmail"
                value={formData.approvedByEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="approvedby-form-input"
              />
            </div>
          </div>

          <div className="approval-sects">
            <div className="section-title">ReceivedBy:</div>
            <div className="form-grid">
              <CustomDropdown field="receivedByUser" className="receivedby-form-input" />

              <label htmlFor="receivedByEmail" className="receivedBy-form-label">
                {/* Email */}
              </label>
              <input
                type="email"
                id="receivedByEmail"
                name="receivedByEmail"
                value={formData.receivedByEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-input-receivedBy"
              />
            </div>
          </div>

          <div className="button-container">
            <button type="button" className="approval-cancel-button" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="approval-save-button" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApprovalModal
