import React, { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import regLogo from "../assets/fullLogo.jpg";
import departmentIcon from "../assets/down.png";
import userIcon from "../assets/user-icon.png";
import eyeOpenIcon from "../assets/eye-open.png"; 
import eyeClosedIcon from "../assets/eye-closed.png";
   

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState("");
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = () => {
        if (selectedCompany) {
            const userDepartment = localStorage.getItem("userDepartment"); // Retrieve Department
            navigate("/nutraTech/form", { state: { company: selectedCompany, department: userDepartment} });
        } else {
            alert("Please select a company");
        }
    }

    return (
        <div className="login-form-container">
            <div className="login-box-container">
                <div className="login-header">
                    <div className="reg-logo">
                        <img src={regLogo} alt="Logo" id="reglogo" />
                    </div>
                </div>

                <h1>Login</h1>

                <div className="login-field-box">
                    <label htmlFor="deptype" className="dept-label">Company</label>
                    <div className="login-input-container">
                        <select id="deptype" className="login-dropdown" onChange={(e) => setSelectedCompany(e.target.value)}>
                            <option value="">Select Department</option>
                            <option value="NutraTech Biopharma, Inc">Nutratech Biopharma, Inc</option>
                            <option value="Avli Biocare, Inc">Avli BioCare, Inc</option>
                            <option value="Apthealth, Inc">Apthealth, Inc</option>
                        </select>
                        <img src={departmentIcon} alt="Dept Icon" className="company-dropdown-icon" />
                    </div>
                </div>

                <div className="login-field-box">
                    <label htmlFor="username">Username</label>
                    <div className="log-input-container">
                        <img src={userIcon} alt="User Icon" className="input-icon" />
                        <input type="text" id="username" required />
                    </div>
                </div>

                <div className="login-field-box-password">
                    <label htmlFor="password">Password</label>
                    <div className="log-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
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

                <button type="submit" className="login-button" onClick={handleLogin}>LOGIN</button>

                <div className="register-link">
                    <p>Don't have an Account? <a className="reg-click" href="register/form">Click here</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
