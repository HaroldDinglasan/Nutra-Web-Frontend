"use client"

import { useState, useEffect, useRef } from "react"
import "../styles/ApprovalModal.css"
import axios from "axios"

const ApprovalModal = ({ onClose }) => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    checkedByUser: "",
    checkedByEmail: "",
    checkedByUserOid: null,
    approvedByUser: "",
    approvedByEmail: "",
    approvedByUserOid: null,
    receivedByUser: "",
    receivedByEmail: "",
    receivedByUserOid: null,
  })

  // Get userId from localStorage
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get userId from localStorage
    const userId = localStorage.getItem("userId")

    if (userId) {
      setCurrentUserId(Number(userId))

      // Set the current user as the default for all approval roles
      setFormData((prev) => ({
        ...prev,
        checkedByUserOid: Number(userId),
        approvedByUserOid: Number(userId),
        receivedByUserOid: Number(userId),
      }))
    }
  }, [])

  // states for custom dropdowns
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchTerms, setSearchTerms] = useState({
    checkedByUser: "",
    approvedByUser: "",
    receivedByUser: "",
  })

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

  // Fetch employees from the API
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

  // Load existing approval settings if available
  useEffect(() => {
    const fetchExistingApprovals = async () => {
      if (!currentUserId) return

      try {
        const response = await axios.get(`http://localhost:5000/api/approvals/user/${currentUserId}`)

        if (response.data.data && response.data.data.length > 0) {
          const approval = response.data.data[0]

          // Find employee names for the IDs
          const findEmployeeName = (id) => {
            const employee = employees.find((emp) => emp.Oid === id)
            return employee ? employee.FullName : currentUserName
          }

          // Only update if we have employees loaded
          if (employees.length > 0) {
            setFormData({
              checkedByUser: findEmployeeName(approval.CheckedById),
              checkedByEmail: approval.CheckedByEmail || "",
              checkedByUserOid: approval.CheckedById || currentUserId,
              approvedByUser: findEmployeeName(approval.ApprovedById),
              approvedByEmail: approval.ApprovedByEmail || "",
              approvedByUserOid: approval.ApprovedById || currentUserId,
              receivedByUser: findEmployeeName(approval.ReceivedById),
              receivedByEmail: approval.ReceivedByEmail || "",
              receivedByUserOid: approval.ReceivedById || currentUserId,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching existing approvals:", error)
  
      }
    }

    if (employees.length > 0) {
      fetchExistingApprovals()
    }
  }, [currentUserId, employees, currentUserName])

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
      return employees.slice(0, 5) // Show only 5 list employee
    }
    return employees.filter((emp) => emp && emp.FullName && emp.FullName.toLowerCase().includes(searchTerm))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Ensure we have the current user ID
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
      // Check if an approval record already exists for this user
      const checkResponse = await axios.get(`http://localhost:5000/api/approvals/user/${currentUserId}`)

      // Ensure all approval IDs have values (use currentUserId as default)
      const approvalData = {
        UserID: currentUserId,
        ApplicType: "PRF",
        CheckedById: formData.checkedByUserOid || currentUserId,
        CheckedByEmail: formData.checkedByEmail || null,
        ApprovedById: formData.approvedByUserOid || currentUserId,
        ApprovedByEmail: formData.approvedByEmail || null,
        ReceivedById: formData.receivedByUserOid || currentUserId,
        ReceivedByEmail: formData.receivedByEmail || null,
      }

      let response

      // If approval record exists, update it
      if (checkResponse.data.data && checkResponse.data.data.length > 0) {
        const approvalId = checkResponse.data.data[0].ApproverAssignID
        response = await axios.put(`http://localhost:5000/api/approvals/${approvalId}`, approvalData)
        console.log("Approval settings updated:", response.data)
      } else {
        // Otherwise create a new record
        response = await axios.post("http://localhost:5000/api/approvals", approvalData)
        console.log("Approval settings created:", response.data)
      }

      // Save approval names to localStorage for use in the form
      localStorage.setItem("checkedByUser", formData.checkedByUser)
      localStorage.setItem("approvedByUser", formData.approvedByUser)
      localStorage.setItem("receivedByUser", formData.receivedByUser)

      window.dispatchEvent(
        new CustomEvent("approvalSettingsUpdated", {
          detail: {
            checkedByUser: formData.checkedByUser,
            approvedByUser: formData.approvedByUser,
            receivedByUser: formData.receivedByUser,
          },
        }),
      )

      alert("Approval settings saved successfully!")
      onClose()
    } catch (error) {
      console.error("Error saving approval settings:", error)
      setError(error.response?.data?.message || "Failed to save approval settings. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Custom dropdown component
  const CustomDropdown = ({ field, label, className }) => (
    <>
      <label htmlFor={field} className={field.includes("approved") ? "approvedby-form-label" : "form-label"}>
        {label}
      </label>
      <div ref={dropdownRefs[field]} className="custom-dropdown-container" style={{ position: "relative" }}>
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
          <span>▼</span>
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
              zIndex: 100,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
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
                    key={index}
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

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal">
        <div className="approval-modal-header">
          <h2>Approval Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="approval-subtitle">Design the approvals this template will need to follow.</div>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", margin: "10px 0", padding: "10px", backgroundColor: "#ffeeee", borderRadius: "4px" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="approval-form">
          <div className="approval-section">
            <div className="section-title">CheckedBy:</div>
            <div className="form-grid">
              <CustomDropdown field="checkedByUser" label="user" className="form-input" />

              <label htmlFor="checkedByEmail" className="form-label">
                email
              </label>
              <input
                type="email"
                id="checkedByEmail"
                name="checkedByEmail"
                value={formData.checkedByEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>
          </div>

          <div className="approval-section">
            <div className="section-title">ApprovedBy:</div>
            <div className="form-grid">
              <CustomDropdown field="approvedByUser" label="user" className="approvedby-form-input" />

              <label htmlFor="approvedByEmail" className="approvedby-form-label">
                email
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

          <div className="approval-section">
            <div className="section-title">ReceivedBy:</div>
            <div className="form-grid">
              <CustomDropdown field="receivedByUser" label="user" className="form-input" />

              <label htmlFor="receivedByEmail" className="form-label">
                email
              </label>
              <input
                type="email"
                id="receivedByEmail"
                name="receivedByEmail"
                value={formData.receivedByEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-input"
              />
            </div>
          </div>

          <div className="button-container">
            <button type="button" className="approval-cancel-button" onClick={onClose} disabled={submitting}>
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
