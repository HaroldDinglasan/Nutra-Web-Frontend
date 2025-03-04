import React from "react";
import "../styles/RequestForm.css";
import logo from "../assets/logo.jpg";
import userLogo from "../assets/profile-user.png";
import downloadLogo from "../assets/downloads.png";
import printLogo from "../assets/printing.png";


const RequestForm = () => {
    return ( 
        <>
            <div className="nav-bar-container">
                <div className="nav-bar-logo">
                    <img src={logo} alt="Company Logo" />
                    <label className="nav-bar-label">NutraTech</label>    
                </div>

                <div className="nav-icons">
                    <img src={printLogo} alt="Print Logo" />
                    <img src={downloadLogo} alt="Download Logo" />
                    <img src={userLogo} alt="User Logo" />
                </div>
                
            </div>

        
            <div className="form-container">

                <div className="form-box-container">
            
                    <div className="header">
                        <div>
                            <h1 className="header-one">NutraTech</h1>
                            <h2 className="header-two">BIOPHARMA INC.</h2>
                            <h3 className="header-three">Brgy. Balubad II, Silang Cavite, Philippines</h3>
                            <h3 className="header-four">Tels.: • (02) 579-0954 • (02) 986-0729 • (02) 925-9515</h3>
                        </div>
                        <div className="logo">
                            <img src={logo} alt="Company Logo" />
                        </div>
                    </div>

                    <div className="form-header">
                        <h1 className="header-one-label">PURCHASE REQUEST FORM</h1>
                    </div>

                    <div className="field-box">
                        <label className="header-dept-label">Department (charge to) :</label>
                        <div className="input-insert">
                            <input type="text" id="department" required />
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

export default RequestForm;
