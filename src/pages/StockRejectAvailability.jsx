import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/StockRejectAvailability.css";

const StockRejectAvailability = () => {
  
  // Gets the current URL (including the ?parameters)
  const location = useLocation();

  // Allows us to read values after the "?" in the URL
  const params = new URLSearchParams(location.search);

  // Getting values from the URL query parameters
  // Example: ?prfId=123&stockCode=STK001
  const [prfId, setPrfId] = useState(params.get("prfId"));
  const [prfNo, setPrfNo] = useState(params.get("prfNo"));

  const [stockCode, setStockCode] = useState(params.get("stockCode"));
  const [stockName, setStockName] = useState(params.get("stockName"));

  const [stockItems, setStockItems] = useState([]);

  const checkerName = params.get("checkerName");

  const [notedBy, setNotedBy] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // State for loading (when button is clicked)
  const [loading, setLoading] = useState(false);

  // State for success or error message
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStockItems = async () => {
      if (!stockCode && prfId) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/cgs-stock/all-items/${prfId}`
          );

          const data = await res.json();

          if (data.success) {
            setStockItems(data.data);
          }
        } catch (error) {
          console.error("Error fetching stock items:", error);
        }
      }
    };

    fetchStockItems();
  }, [prfId, stockCode]);

  // Function that runs when APPROVE button is clicked
  const handleReject = async () => {
    if (!verifiedBy) {
      alert("Please fill in Noted By and Verified By.");
      return;
    }

    try {
      setLoading(true);

      // ✅ STORE THE RESPONSE
      if (stockItems.length > 0) {
        for (const item of stockItems) {
            await fetch("http://localhost:5000/api/cgs-stock/reject", {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prfId,
              stockCode: item.stockCode,
              stockName: item.stockName,
              notedBy,
              verifiedBy,
              reason: rejectionReason,
            }),
          });
        }

        alert("Stock marked as NOT AVAILABLE successfully.");

        // ✅ Clear inputs after success
        setNotedBy("");
        setVerifiedBy("");
        setRejectionReason("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setPrfNo("");

        setMessage("success");

      } else {
        // Single approve
        const response = await fetch(
          "http://localhost:5000/api/cgs-stock/reject",
          {
            method: "POST",
              headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prfId,
              stockCode,
              stockName,
              notedBy,
              verifiedBy,
              reason: rejectionReason,
            }),
          }
        );

        const data = await response.json();

        // ✅ CHECK IF ALREADY VERIFIED
        if (!response.ok) {
          alert(data.message);
          return;
        }

        alert("Stock marked as REJECTED successfully.");

        // ✅ Clear inputs after success
        setNotedBy("");
        setVerifiedBy("");
        setRejectionReason("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setPrfNo("");

        setMessage("success");
      }

    } catch (error) {
      alert("Server error occurred.");
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reject-page">
      <div className="reject-card">
        <h2 className="reject-title">Stock Availability Review – Rejected</h2>

        <div className="reject-field">
          <label>PRF No</label>
          <input value={prfNo || ""} disabled />
        </div>

        <div className="stock-list">
          {stockItems.length > 0 ? (
            stockItems.map((item, index) => (
              <div className="stock-item" key={index}>
                <div className="stock-row">
                  <div className="approve-field">
                    <label>Stock Code</label>
                    <input value={item.stockCode} disabled />
                  </div>

                  <div className="approve-field">
                    <label>Stock Name</label>
                    <input value={item.stockName} disabled />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // ✅ fallback for single item
            <div className="stock-item">
              <div className="stock-row">
                <div className="approve-field">
                  <label>Stock Code</label>
                  <input value={stockCode || ""} disabled />
                </div>

                <div className="approve-field">
                  <label>Stock Name</label>
                  <input value={stockName || ""} disabled />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="reject-field">
            <label>Rejection Reason: </label>
            <input
              type="text"
              placeholder=""
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              />
        </div>

        {/* <div className="reject-field">
            <label>Noted By</label>
            <input
              type="text"
              placeholder="Enter name"
              value={notedBy}
              onChange={(e) => setNotedBy(e.target.value)}
            />
        </div> */}

        <div className="approve-footer">

          <div className="reject-field">
              <label>Verified By</label>
              <input
                type="text"
                placeholder="Enter name"
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
              />
          </div>

          <button
            className="reject-button"
            onClick={handleReject}
            disabled={loading}
          >
            {loading ? "Processing..." : "REJECT"}
          </button>

          {message === "success" && (
            <p className="reject-message success">
              ❌ Stock marked as NOT AVAILABLE successfully.
            </p>
          )}

          {message === "error" && (
            <p className="reject-message error">
              ❌ Error processing approval.
            </p>
          )}
        </div>

      </div>
      
    </div>
  );
};

export default StockRejectAvailability;
