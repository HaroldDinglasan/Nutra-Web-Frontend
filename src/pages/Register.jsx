"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Register.css"
import regLogo from "../assets/fullLogo.jpg"
import departmentIcon from "../assets/down.png"
import userIcon from "../assets/user-icon.png"
import passwordIcon from "../assets/eye-closed.png"
import { Link } from "react-router-dom"
import eyeOpenIcon from "../assets/eye-open.png"
import eyeClosedIcon from "../assets/eye-closed.png"
import axios from "axios"

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [department, setDepartment] = useState("")
  const [departmentId, setDepartmentId] = useState(null)
  const [fullname, setFullname] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [employees, setEmployees] = useState([]) // Store fetched employee names
  const [filteredEmployees, setFilteredEmployees] = useState([]) // Filtered results
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees")
        setEmployees(response.data)
      } catch (error) {
        console.error("❌ Error fetching employee data:", error)
      }
    }
    fetchEmployees()
  }, [])

  // Set departmentId when department changes
  useEffect(() => {
    let id = null
    switch (department) {
      case "Human Resource":
        id = 1
        break
      case "Information Technology":
        id = 2
        break
      case "Finance":
        id = 3
        break
      case "Marketing":
        id = 4
        break
      case "Purchasing":
        id = 5
        break
      case "Production":
        id = 6
        break
      case "Corplan":
        id = 7
        break
      default:
        id = null
    }
    setDepartmentId(id)
  }, [department])

  // Handle user input
  const handleFullnameChange = (e) => {
    const input = e.target.value
    setFullname(input)

    // Filter only non-null values
    const filtered = employees.filter((emp) => emp.FullName && emp.FullName.toLowerCase().includes(input.toLowerCase()))

    setFilteredEmployees(filtered)
    setShowDropdown(filtered.length > 0)
  }

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle selection from dropdown
  const handleSelectName = (name) => {
    setFullname(name)
    setShowDropdown(false) // Hide dropdown after selection
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  // Send POST request to the Backend
  const handleRegister = async () => {
    if (!department || !fullname || !username || !password) {
      alert("Please fill in all fields!")
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        departmentType: department,
        departmentId: departmentId,
        fullName: fullname,
        username: username,
        password: password,
      })

      // If we get here, registration was successful
      alert("Registration successful!")
      localStorage.setItem("userDepartment", department)
      localStorage.setItem("userFullname", fullname)
      localStorage.setItem("userDepartmentId", departmentId)
      navigate("/login")
    } catch (error) {
      console.error("❌ Registration error:", error)

      // Check if the error response contains our message
      if (error.response && error.response.data) {
        // Show the specific error message from the server
        alert(error.response.data.message || "Registration failed")
      } else {
        // Generic error message
        alert("Registration failed. Please try again.")
      }
    }
  }

  return (
    <div className="register-form-container">
      <div className="register-box-container">
        <div className="register-header">
          <div className="reg-logo">
            <img src={regLogo || "/placeholder.svg"} alt="Logo" id="reglogo" />
          </div>
        </div>

        <h1>Register</h1>

        <div className="reg-field-box">
          <label htmlFor="deptype">Department Type</label>
          <div className="reg-input-container">
            <select
              id="deptype"
              className="register-dropdown"
              size="1"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              <option value="Human Resource">Human Resources</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Purchasing">Purchasing</option>
              <option value="Production">Production</option>
              <option value="Corplan">Corplan</option>
            </select>
            <img src={departmentIcon || "/placeholder.svg"} alt="Dept Icon" className="dropdown-icon" />
          </div>
        </div>

        <div className="reg-field-box" ref={dropdownRef}>
          <label htmlFor="nametype">Full Name</label>
          <div className="fullname-dropdown-container">
            <input
              type="text"
              id="nametype"
              className="fullname-input"
              value={fullname}
              onChange={handleFullnameChange}
              placeholder="Type or select a name"
            />

            {showDropdown && filteredEmployees.length > 0 && (
              <div className="dropdown-list">
                {filteredEmployees.map((employee, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => {
                      setFullname(employee.FullName)
                      setShowDropdown(false) // Hide dropdown after selection
                    }}
                  >
                    {employee.FullName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="reg-field-box">
          <label htmlFor="username">Username</label>
          <div className="reg-input-container">
            <img src={userIcon || "/placeholder.svg"} alt="User Icon" className="input-icon" />
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
        </div>

        <div className="reg-field-box-password">
          <label htmlFor="password">Password</label>
          <div className="reg-input-container">
            <img src={passwordIcon || "/placeholder.svg"} alt="Password Icon" className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? eyeOpenIcon : eyeClosedIcon}
              alt="Toggle Password Visibility"
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            />
          </div>
        </div>

        <button type="submit" className="register-button" onClick={handleRegister}>
          REGISTER
        </button>

        <div className="register-login-link">
          <p>
            Already have an Account?{" "}
            <Link to="/login" className="login-click">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
