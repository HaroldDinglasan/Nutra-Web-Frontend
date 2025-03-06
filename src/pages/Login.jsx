import React from "react";
import "../styles/Login.css";
import regLogo from "../assets/fullLogo.jpg";
import departmentIcon from "../assets/down.png";
import userIcon from "../assets/user-icon.png";
import passwordIcon from "../assets/eye.png";


const Login = () => {
    return (
        <>
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
                            <select id="deptype" className="login-dropdown">
                                <option value="">Select Department</option>
                                <option value="hr">Nutratech Biopharma, Inc</option>
                                <option value="it">Avli BioCare, Inc</option>
                                <option value="it">Apthealth, Inc</option>
                            </select>
                            <img src={departmentIcon} alt="Dept Icon" className="company-dropdown-icon" />
                        </div>
                    </div>

                    <div className="login-field-box">
                        <label htmlFor="username">Username</label>
                        <div className="log-input-container">
                            <img src={userIcon} alt="User Icon" className="input-icon" />
                            <input type="text" id="username" required></input>
                        </div>
                    </div>

                    <div className="login-field-box-password">
                        <label htmlFor="password">Password</label>
                        <div className="log-input-container">
                            <img src={passwordIcon} alt="Password Icon" className="input-icon" />
                            <input type="text" id="password" required></input>
                        </div>
                    </div>

                    <buton type="submit" className="login-button">LOGIN</buton>

                    <div className="register-link">
                        <p>Don't have an Account? <a className="reg-click" href="register/form">Click here</a></p>
                    </div>

                </div>

           </div>

        </>
    );
};

export default Login;