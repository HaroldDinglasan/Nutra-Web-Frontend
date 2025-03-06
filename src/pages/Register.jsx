import React from "react";
import "../styles/Register.css";
import regLogo from "../assets/fullLogo.jpg";
import departmentIcon from "../assets/down.png";
import userIcon from "../assets/user-icon.png";
import passwordIcon from "../assets/eye-closed.png";
import {Link } from 'react-router-dom';

const Register = () => {
    return (
        <>
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
                        <select id="deptype" className="register-dropdown">
                            <option value="">Select Department</option>
                            <option value="hr">Human Resources</option>
                            <option value="it">Information Technology</option>
                            <option value="finance">Finance</option>
                            <option value="marketing">Marketing</option>
                        </select>
                        <img src={departmentIcon} alt="Dept Icon" className="dropdown-icon" />
                    </div>
                </div>


                <div className="reg-field-box">

                    <label htmlFor="username">Username</label>
                    <div className="reg-input-container">
                        <img src={userIcon} alt="User Icon" className="input-icon" />
                        <input type="text" id="username" required></input>
                    </div>

                </div>

                <div className="reg-field-box-password">

                    <label htmlFor="password">Password</label>
                    <div className="reg-input-container">
                        <img src={passwordIcon} alt="Password Icon" className="input-icon" />
                        <input type="text" id="password" required></input>
                    </div>
                   
                </div>

                <buton type="submit" className="register-button">REGISTER</buton>

                <div className="login-link">
                    <p>Already have an Account? <Link to="/login" className="login-click">Login here</Link></p>
                </div>


            </div>

        </div>

        </>
    );
};

export default Register;