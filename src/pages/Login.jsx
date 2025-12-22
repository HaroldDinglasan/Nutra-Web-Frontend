"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import regLogo from "../assets/fullLogo.jpg"
import departmentIcon from "../assets/down.png"
import userIcon from "../assets/user-icon.png"
import eyeOpenIcon from "../assets/eye-open.png"
import eyeClosedIcon from "../assets/eye-closed.png"
import "../styles/Login.css"

const Login = () => {
  const [prfId, setPrfId] = useState(null)
  const [pendingPrfData, setPendingPrfData] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const idFromUrl = params.get("prfId")
    const noFromUrl = params.get("prfNo")
    const dateFromUrl = params.get("prfDate") // una ilagay itu
    const departmentChargeFromUrl = params.get("departmentCharge") // <CHANGE> Get departmentCharge from email link
    const assignedActionFromUrl = params.get("assignedAction") // Kinukuha yung assigned action sa email-service

    // Step 1: Kunin ang full names ng mga approvers galing sa email link
    const preparedByFromUrl = params.get("preparedBy") // First step
    const checkedBy = params.get("checkedBy")
    const approvedBy = params.get("approvedBy")
    const receivedBy = params.get("receivedBy")

    // decode any URL encoding (like N%2087502 → N 87502)
    const decodedPrfNo = noFromUrl ? decodeURIComponent(noFromUrl) : null
    const decodedPrfDate = dateFromUrl ? decodeURIComponent(dateFromUrl) : null // pangalawa ilagay itu
    const decodedPreparedBy = preparedByFromUrl ? decodeURIComponent(preparedByFromUrl) : null // Second step
    const decodedDepartmentCharge = departmentChargeFromUrl ? decodeURIComponent(departmentChargeFromUrl) : null

    if (idFromUrl) {
      // console.log("🔗 PRF ID received from email:", idFromUrl)
      setPrfId(idFromUrl)
    }

    if (decodedPrfNo) {
      // console.log("🧾 PRF No received from email:", decodedPrfNo)
    }

    // Step 2: Mag store yung PRF at approver information
    if (idFromUrl && decodedPrfNo) {
      const prfInfo = {
        prfId: idFromUrl,
        prfNo: decodedPrfNo,
        prfDate: decodedPrfDate || "", // pangatlo store email date
        preparedBy: decodedPreparedBy || "", // Third step
        checkedBy: checkedBy ? decodeURIComponent(checkedBy) : "",
        approvedBy: approvedBy ? decodeURIComponent(approvedBy) : "",
        receivedBy: receivedBy ? decodeURIComponent(receivedBy) : "",
        assignedAction: assignedActionFromUrl || "",
        departmentCharge: decodedDepartmentCharge || "", // <CHANGE> Store departmentCharge instead of departmentType
      }
      setPendingPrfData(prfInfo)
      localStorage.setItem("pendingPRF", JSON.stringify(prfInfo))
      
      if (assignedActionFromUrl) {
        localStorage.setItem("assignedAction", assignedActionFromUrl)
      }
    }
  }, [location])

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      setErrors({
        username: !username ? "Username is required" : "",
        password: !password ? "Password is required" : "",
      })
      return
    }

    if (!selectedCompany) {
      alert("Please select a company")
      return
    }

    setErrors({}) // Clear previous errors

    const loginData = { username, password }

    try {
      const response = await fetch("http://localhost:5000/api/save-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok) {
        // user details na sa isang object para sa pagbato ng Approval Modal
        const userData = {
          userId: data.user.userID,
          username: data.user.username,
          fullName: data.user.fullName,
          departmentType: data.user.departmentType,
          departmentId: data.user.departmentId,
          company: selectedCompany,
        }

        // Store unified user data for all components
        localStorage.setItem("user", JSON.stringify(userData))

        // Save user details in localStorage
        localStorage.setItem("userFullname", data.user.fullName)
        localStorage.setItem("userDepartment", data.user.departmentType)
        localStorage.setItem("userDepartmentId", data.user.departmentId) // Store department Id
        localStorage.setItem("userCompany", selectedCompany) // Store selected Company
        localStorage.setItem("userId", data.user.userID) // Store the userID

        // Check if user is purchasing admin
        const isPurchasingAdmin =
          username.toLowerCase().includes("admin") ||
          (data.user.role && data.user.role === "admin") ||
          (data.user.departmentType && data.user.departmentType.toLowerCase().includes("purchasing"))

        // Store user role
        localStorage.setItem("userRole", isPurchasingAdmin ? "admin" : "user")

        if (pendingPrfData && pendingPrfData.prfId) {
          localStorage.setItem("preparedByUser", pendingPrfData.preparedBy) // Fourth step
          localStorage.setItem("checkedByUser", pendingPrfData.checkedBy || "")
          localStorage.setItem("approvedByUser", pendingPrfData.approvedBy || "")
          localStorage.setItem("receivedByUser", pendingPrfData.receivedBy || "")
          localStorage.setItem("prfDateFromEmail", pendingPrfData.prfDate || "") // Pang apat
          if (pendingPrfData.departmentCharge) {
            localStorage.setItem("prfDepartmentCharge", pendingPrfData.departmentCharge) // <CHANGE> Store departmentCharge
          }
          if (pendingPrfData.assignedAction) {
            localStorage.setItem("assignedAction", pendingPrfData.assignedAction)
          }

          navigate(`/prf/${pendingPrfData.prfId}`, {
            state: {
              company: selectedCompany,
              fromEmailLink: true,
              prfNo: pendingPrfData.prfNo,
              prfId: pendingPrfData.prfId,
              prfDate: pendingPrfData.prfDate,
              preparedBy: pendingPrfData.preparedBy,
              departmentCharge: pendingPrfData.departmentCharge, // <CHANGE> Pass departmentCharge in navigation
              checkedBy: pendingPrfData.checkedBy,
              approvedBy: pendingPrfData.approvedBy,
              receivedBy: pendingPrfData.receivedBy,
              assignedAction: pendingPrfData.assignedAction,
            },
          })
          return

        }

        // All USERS go to DASHBOARD first
        if (isPurchasingAdmin) {
          // Purchasing admin goes to admin dashboard
          navigate("/prf/list", {
            state: { company: selectedCompany, isAdmin: true, showDashboard: true },
          })
          // Set the hash after navigation to ensure proper dashboard display
          setTimeout(() => {
            window.location.hash = "#dashboard"
          }, 100)
        } else {
          // Regular users (IT, HR, Finance, etc.) go to user dashboard
          navigate("/prf/list#dashboard", {
            state: { company: selectedCompany, isAdmin: false },
          })
        }
      } else {
        alert("❌ " + data.message)
      }
    } catch (error) {
      console.error("Error:", error)
      alert(" An error occurred while logging in.")
    }
  }

  return (
    <div className="login-form-container">
      <div className="login-box-container">
        <div className="login-header">
          <div className="reg-logo">
            <img src={regLogo || "/placeholder.svg"} alt="Logo" id="reglogo" />
          </div>
        </div>

        <h1>Login</h1>

        <div className="login-field-box">
          <label htmlFor="deptype" className="dept-label">
            Company
          </label>
          <div className="login-input-container">
            <select
              id="deptype"
              className="login-dropdown"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">Select Company</option>
              <option value="NutraTech Biopharma, Inc">Nutratech Biopharma, Inc</option>
              <option value="Avli Biocare, Inc">Avli BioCare, Inc</option>
              <option value="Apthealth, Inc">Apthealth, Inc</option>
            </select>
            <img src={departmentIcon || "/placeholder.svg"} alt="Dept Icon" className="company-dropdown-icon" />
          </div>
        </div>

        <div className="login-field-box">
          <label htmlFor="username">Username</label>
          <div className="log-input-container">
            <img src={userIcon || "/placeholder.svg"} alt="User Icon" className="input-icon" />
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          {errors.username && <p className="error-text-show">{errors.username}</p>}
        </div>

        <div className="login-field-box-password">
          <label htmlFor="password">Password</label>
          <div className="log-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              src={showPassword ? eyeOpenIcon : eyeClosedIcon}
              alt="Toggle Password Visibility"
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            />
          </div>
          {errors.password && <p className="error-text-show">{errors.password}</p>}
        </div>

        <button type="submit" className="login-button" onClick={handleLogin}>
          LOGIN
        </button>

        <div className="login-register-link">
          <p>
            Don't have an Account?{" "}
            <a className="reg-click" href="register/form">
              Click here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
