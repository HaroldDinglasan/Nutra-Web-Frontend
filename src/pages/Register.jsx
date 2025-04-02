import React, { useState, useEffect, useRef } from "react";
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
    const [departmentId, setDepartmentId] = useState(null);
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [employees, setEmployees] = useState([]); // Store fetched employee names
    const [filteredEmployees, setFilteredEmployees] = useState([]); // Filtered results
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    

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

    // Set departmentId when department changes
    useEffect(() => {
    let id = null
    switch (department) {
      case "Human Resource Department":
        id = 1
        break
      case "Information Technology Department":
        id = 2
        break
      case "Finance Department":
        id = 3
        break
      case "Marketing Department":
        id = 4
        break
      default:
        id = null
    }
    setDepartmentId(id)
  }, [department])

     // Handle user input
    const handleFullnameChange = (e) => {
        const input = e.target.value;
        setFullname(input);
    
        // Ensure we filter only non-null values
        const filtered = employees.filter(emp =>
            emp.FullName && emp.FullName.toLowerCase().includes(input.toLowerCase())
        );
    
        setFilteredEmployees(filtered);
        setShowDropdown(filtered.length > 0);
    };

    // Handle click outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


     // Handle selection from dropdown
    const handleSelectName = (name) => {
        setFullname(name);
        setShowDropdown(false); // Hide dropdown after selection
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Send POST request to the Backend
    const handleRegister = async () => {
        if (!department || !fullname || !username || !password) {
            alert("Please fill in all fields!");
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/api/register", {
                departmentType: department,
                departmentId: departmentId, // Inlcude departmentId in the request
                fullName: fullname,
                username: username,
                password: password,
            });
    
            if (response.status === 201) {
                alert("Registration successful!");
                localStorage.setItem("userDepartment", department);
                localStorage.setItem("userFullname", fullname);
                localStorage.setItem("userDepartmentId", departmentId) // Store departmentId in localStorage
                navigate("/login");
            }
        } catch (error) {
            console.error("❌ Registration error:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Registration failed. Please try again.");
        }
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
                                            setFullname(employee.FullName);
                                            setShowDropdown(false); // Hide dropdown after selection
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
