import React from "react";
import "../styles/RequestForm.css";

const RequestForm = () => {
    return ( 
        <div className="form-container">

            <div className="form-box-container">

                <div className="header">

                    <div className="logo"></div>
                    <h1>Nutra Tech</h1>
                    <h2>BIOPHARMA, INC</h2>
                    <h3>Brgy. Balubad II, Silang Cavite, Philippines</h3>
                    <h3>Tels.: (02) 579-0954 (02) 986-0729 (02) 925-9515</h3>
                </div>

                <div className="form-header">
                    <h1>PURCHASE REQUEST FORM</h1>
                </div>

                <div className="field-box">
                    <label>DEPARTMENT (charge to)  :</label>
                    <div className="insert">
                        <input type="text" id="department" required />
                    </div>
                </div>


                <div className="field-box">
                    <label>DATE</label>
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
                        </tbody>
                    </table>
                </div>

                {/* <div className="approval-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Prepared By:</th>
                                <th>Checked By:</th>
                                <th>Approved By:</th>
                                <th>Received By:</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div> */}



            </div>
        </div>
    );
};

export default RequestForm;
