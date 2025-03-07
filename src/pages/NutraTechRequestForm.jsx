import React, { useState } from "react";
import "../styles/NutratechForm.css";
import userLogo from "../assets/user-icon.png";
import downloadLogo from "../assets/downloads.png";
import printLogo from "../assets/printing.png";
import dropdown from "../assets/down.png";
import { useLocation, useNavigate } from "react-router-dom";    

import NutraTechlogo from "../assets/NTBI.png";
import avliLogo from "../assets/AVLI.png";
import apthealthLogo from "../assets/apthealth inc full logo.png";

import nutraheaderlogo from "../assets/nutratechlogo.jpg";
import apthealtheaderLogo from "../assets/apthealth logo.png";
import avliheaderLogo from "../assets/avli biocare.logo.png";



const NutraTectForm = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const { company } = location.state || { company: "NutraTech Biopharma, Inc" }; // Default value

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSignout = () => {
        navigate("/login");
    };

    const headerLogos = {
        "NutraTech Biopharma, Inc": nutraheaderlogo,
        "Avli Biocare, Inc": avliheaderLogo,
        "Apthealth, Inc": apthealtheaderLogo,
    };

    const companyLogos = {
        "NutraTech Biopharma, Inc": NutraTechlogo,
        "Avli Biocare, Inc": avliLogo,
        "Apthealth, Inc": apthealthLogo,
    };



    return ( 
        <>
            <div className="nav-bar-container">
                <div className="nav-bar-logo">
                    <img src={headerLogos[company]} alt="Company Logo" />
                    <label className="nav-bar-label">{company}</label>    
                </div>
                <div className="nav-icons">
                    <img src={printLogo} alt="Print Logo" />
                    <img src={downloadLogo} alt="Download Logo" />

                
                    <div className="user-profile-container">
                        <img src={userLogo} alt="User Logo" onClick={toggleDropdown} className="user-icon"/>
                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <p className="dropdown-user">Harold Dinglasan</p>
                                {/* <p className="dropdown-email">HaroldDinglasan@gmail.com</p> */}
                                <button className="signout-button" onClick={handleSignout}>Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        
            <div className="form-container">

                <div className="form-box-container">
            
                    <div className="header">
                        <div>
                            <div className="logo">
                                <img src={companyLogos[company]} alt="Company Logo" />
                            </div>  
                            <h3 className="header-three">Brgy. Balubad II, Silang Cavite, Philippines</h3>
                            <h3 className="header-four">Tels.: • (02) 579-0954 • (02) 986-0729 • (02) 925-9515</h3>
                        </div>
                        
                    </div>

                    <div className="form-header">
                        <div className="number-code-label">
                            <label>No. N 12045</label>
                        </div>
                        <h1 className="header-one-label">PURCHASE REQUEST FORM</h1>
                    </div>

                    <div className="field-box">
                        
                        <div className="input-container">
                            <label className="header-dept-label" htmlFor="department">Department (charge to):</label>
                            <div className="dropdown-wrapper">
                                <select id="department" className="department-dropdown">
                                    <option value="">Select Department</option>
                                    <option value="hr">Human Resources</option>
                                    <option value="finance">Finance</option>
                                    <option value="it">Information Technology</option>
                                    <option value="marketing">Marketing</option>
                                </select>
                                <img src={dropdown} alt="Dropdown Icon" className="dropdown-icon" />
                            </div>
                        </div>

                        <div className="date-container">
                            <label className="date-label">Date:</label>
                            <input type="date" id="date" className="date-input" required />
                        </div>
                    </div>

                    <div className="following-label">
                        <label>I would like to request the following :</label>
                    </div>


                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>STOCK CODE</th>
                                    <th>QUANTITY</th>
                                    <th>UNIT</th>
                                    <th>DESCRIPTION</th>
                                    <th>DATE NEEDED</th>
                                    <th>PURPOSE OF REQUISITION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Item 1</td>
                                    <td>10 quantity</td>
                                    <td>CT21-0047</td>
                                    <td>Effective</td>
                                    <td>March 3, 2025</td>
                                    <td>Reporting needs</td>
                                </tr>
                                <tr>
                                    <td>Item 1</td>
                                    <td>10 quantity</td>
                                    <td>CT21-0047</td>
                                    <td>Effective</td>
                                    <td>March 3, 2025</td>
                                    <td>Reporting needs</td>
                                </tr>
                                <tr>
                                    <td>Item 1</td>
                                    <td>10 quantity</td>
                                    <td>CT21-0047</td>
                                    <td>Effective</td>
                                    <td>March 3, 2025</td>
                                    <td>Reporting needs</td>
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>

                    <div className="approval-section">
                        <div className="approval-box">
                            <h3>Prepared By:</h3>
                            <div className="signature-box"></div>
                            <p className="signature-label">Signature over printed Name / Date</p>
                        </div>

                        <div className="approval-box">
                            <h3>Checked By:</h3>
                            <div className="signature-box"></div>
                            <p className="signature-label">Signature over printed Name / Date</p>
                        </div>

                        <div className="approval-box">
                            <h3>Approved By:</h3>
                            <div className="signature-box"></div>
                            <p className="signature-label">Signature over printed Name / Date</p>
                        </div>

                        <div className="approval-box">
                            <h3>Received By:</h3>
                            <div className="signature-box"></div>
                            <p className="signature-label">Date / Time / Signature</p>
                        </div>
                    </div>


                </div>
            </div>
        </>
    );
};

export default NutraTectForm;
