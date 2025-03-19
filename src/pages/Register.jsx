import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import regLogo from "../assets/fullLogo.jpg";
import departmentIcon from "../assets/down.png";
import userIcon from "../assets/user-icon.png";
import passwordIcon from "../assets/eye-closed.png";
import { Link } from 'react-router-dom';
import eyeOpenIcon from "../assets/eye-open.png"; 
import eyeClosedIcon from "../assets/eye-closed.png";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate(); 
    const [showPassword, setShowPassword] = useState(false);
    const [department, setDepartment] = useState("");
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [employees, setEmployees] = useState([]); // Store fetched employee names

    useEffect(() => {                   
        const fetchEmployees = async () => {    
            try {
                const response = await axios.get("http://localhost:5000/api/employees");
                setEmployees(response.data);
            } catch (error) {
                console.error("❌ Error fetching stock data:", error);
            }
        };
        fetchEmployees();
    }, []);
    
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleRegister = () => {
        if (!department || !fullname) {
            alert("Please select a department and full name.");
            return;
        }

        console.log("Department:", department);
        console.log("Fullname:", fullname);
        console.log("Username:", username);
        console.log("Password:", password);

        // Store selected values in localStorage
        localStorage.setItem("userDepartment", department);
        localStorage.setItem("userFullname", fullname);

        alert("Registration successful!");
        navigate("/login");
    };

    return (
        <div className="register-form-container">
            <div className="register-box-container">
                <div className="register-header">
                    <div className="reg-logo">
                        <img src={regLogo} alt="Logo" id="reglogo" />
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
                            <option value="Human Resource Department">Human Resources</option>
                            <option value="Information Technology Department">Information Technology</option>
                            <option value="Finance Department">Finance</option>
                            <option value="Marketing Department">Marketing</option>    
                        </select>
                        <img src={departmentIcon} alt="Dept Icon" className="dropdown-icon" />
                    </div>
                </div>

                <div className="reg-field-box">
                    <label htmlFor="nametype">Full Name</label>
                    <div className="reg-input-container">
                        <select 
                            id="nametype" 
                            className="fullname-dropdown" 
                            size=""
                            value={fullname} 
                            onChange={(e) => setFullname(e.target.value)}
                        >
                            <option value="">Select Full Name</option>
                            {employees.map((employee, index) => (
                                <option key={index} value={employee.FullName}>
                                    {employee.FullName}
                                </option>
                            ))}
                        </select>
                        <img src={departmentIcon} alt="Dept Icon" className="dropdown-icon" />
                    </div>
                </div>

                <div className="reg-field-box">
                    <label htmlFor="username">Username</label>
                    <div className="reg-input-container">
                        <img src={userIcon} alt="User Icon" className="input-icon" />
                        <input type="text" id="username"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required
                        />
                    </div>
                </div>

                <div className="reg-field-box-password">
                    <label htmlFor="password">Password</label>
                    <div className="reg-input-container">
                        <img src={passwordIcon} alt="Password Icon" className="input-icon" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <img
                            src={showPassword ? eyeOpenIcon: eyeClosedIcon}
                            alt="Toggle Password Visibility"
                            className="password-toggle-icon"
                            onClick={togglePasswordVisibility}  
                        />
                    </div>
                </div>

                <button type="submit" className="register-button" onClick={handleRegister}>REGISTER</button>

                <div className="login-link">
                    <p>Already have an Account? <Link to="/login" className="login-click">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
