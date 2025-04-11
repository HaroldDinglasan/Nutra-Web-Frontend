import React, { useEffect, useState} from "react";
import axios from "axios";
import "../styles/StockcodeModal.css";
import search from "../assets/search.png";
import closeButton from "../assets/close-button.png";

const StockcodeModal = ({ onClose, onSelectStock}) => {
    const [stockItems, setStockItems] = useState([]);
    const [searchStocks, setSearchStocks] = useState("");
    const [filteredStocks, setFilteredStocks] = useState([]);

    // Fetch stock data from backend
    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/stocks");
                setStockItems(response.data);
                setFilteredStocks(response.data); // Filtered items with all items
            } catch (error) {
                console.error("❌ Error fetching stock data:", error);
            }
        };

        fetchStocks();
    }, []);

    // Filter stocks when search term changes
    useEffect(() => {
        if ( searchStocks.trim() === "") {
            setFilteredStocks(stockItems)
        } else {
            const filtered = stockItems.filter(item =>
                item.StockCode.toLowerCase().includes(searchStocks.toLowerCase()) ||
                item.StockName.toLowerCase().includes(searchStocks.toLowerCase())
            );
            setFilteredStocks(filtered);
        }
    }, [searchStocks, stockItems]);

    const handleSelect = (stock) => {
        onSelectStock(stock); // Pass selected stock to parent
        onClose(); 
    };

    const handleSearchChange = (e) => {
        setSearchStocks(e.target.value);
    };

     // Clear search input
    const clearSearch = () => {
        setSearchStocks("")
    }

    return(
        <>
            <div className="stock-modal-container" onClick={onClose}>

                <div className="stock-box-container" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-header">
                        <h2>Stock Items</h2>
                        <button className="close-button" alt="close" onClick={onClose}>
                            <img src={closeButton} alt="close" className="close-icon" />
                        </button>
                    </div>

                    <div className="input-group">
                       
                        <div className="search-list-container">
                            <div className="search-list-wrapper">
                                <svg
                                className="search-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                type="text"
                                placeholder="Search..."
                                value={searchStocks}
                                onChange={handleSearchChange}
                                className="search-input"
                                />
                                {searchStocks && (
                                <button className="clear-search" onClick={clearSearch}>
                                    <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                                )}
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
                            {filteredStocks.map((item, index) => (
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

