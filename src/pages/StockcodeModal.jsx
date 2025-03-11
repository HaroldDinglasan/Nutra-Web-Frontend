import React from "react";
import "../styles/StockcodeModal.css";
// import { FaSearch } from "react-icons/fa";

const StockcodeModal = () => {
    return(
        <>
            <div className="stock-modal-container">

                <div className="stock-box-container">

                    <div className="modal-header">
                        <h2>Available Records</h2>
                    </div>

                    <div className="input-group">
                        <div className="form-fields">
                            <label htmlFor="type">Type:</label>
                            <span className="type-text">Stock Items</span>
                        </div>

                        <div className="search-field">
                            <label htmlFor="search"><b>Search:</b></label>
                            <div className="search-input">
                                <input type="text" id="search" name="search" placeholder="search"/>
                                {/* <FaSearch className="search-icon"/> */}
                            </div>
                        </div>
                    </div>
                    <div className="modal-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Stock Code</th>
                                <th>Stock Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td></td><td></td></tr>
                            <tr><td></td><td></td></tr>
                            <tr><td></td><td></td></tr>
                            <tr><td></td><td></td></tr>
                        </tbody>
                    </table>
                    </div>

                </div>

            </div>
            
        </>
    );
};

export default StockcodeModal;

