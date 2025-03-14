import React, { useEffect, useState} from "react";
import axios from "axios";
import "../styles/StockcodeModal.css";
import search from "../assets/search.png";

const StockcodeModal = ({ onClose, onSelectStock}) => {
    const [stockItems, setStockItems] = useState([]);

    // Fetch stock data from backend
    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/stocks");
                setStockItems(response.data);
            } catch (error) {
                console.error("❌ Error fetching stock data:", error);
            }
        };

        fetchStocks();
    }, []);

    const handleSelect = (stock) => {
        onSelectStock(stock); // Pass selected stock to parent
        onClose(); 
    };


    return(
        <>
            <div className="stock-modal-container" onClick={onClose}>

                <div className="stock-box-container" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-header">
                        <h2>Available Records</h2>
                        <button className="close-button" onClick={onClose}>X</button>
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
                                <img src={search} alt="search logo" id="search" />
                            </div>
                        </div>
                    </div>
                    <div className="modal-table-container">
                    <table>
                        
                        <thead>
                            <tr>
                                <th className="th-modal">Stock Code</th>
                                <th className="th-modal">Stock Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map((item, index) => (
                                <tr key={index} onClick={() => handleSelect(item)} style={{ cursor: "pointer" }}>
                                    <td>{item.StockCode}</td>
                                    <td>{item.StockName}</td>
                                </tr>
                            ))}
                        </tbody>
                        
                    </table>
                    </div>

                </div>

            </div>
            
        </>
    );
};

export default StockcodeModal;

