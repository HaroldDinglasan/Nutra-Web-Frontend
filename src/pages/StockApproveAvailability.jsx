import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/StockApproveAvailability.css";

const StockApproveAvailability = () => {
  
  // Gets the current URL (including the ?parameters)
  const location = useLocation();

  // Allows us to read values after the "?" in the URL
  const params = new URLSearchParams(location.search);

  // Getting values from the URL query parameters
  // Example: ?prfId=123&stockCode=STK001
  const prfId = params.get("prfId");
  const stockCode = params.get("stockCode");
  const stockName = params.get("stockName");
  const prfNo = params.get("prfNo");
  const checkerName = params.get("checkerName");
  const [notedBy, setNotedBy] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");

  // State for loading (when button is clicked)
  const [loading, setLoading] = useState(false);

  // State for success or error message
  const [message, setMessage] = useState("");

  // Function that runs when APPROVE button is clicked
  const handleApprove = async () => {
    if (!notedBy || !verifiedBy) {
      alert("Please fill in Noted By and Verified By.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/cgs-stock/approve",
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
          }),
        }
      );

      const data = await response.json();

      // ✅ THIS IS THE IMPORTANT PART
      if (!response.ok) {
        alert(data.message);  // 🔥 ALERT HERE
        return;
      }

      alert("Stock marked as AVAILABLE successfully.");
      setMessage("success");

    } catch (error) {
      alert("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approve-page">
      <div className="approve-card">
        <h2 className="reject-title">Stock Availability Review – Approved</h2>

        <div className="approve-field">
          <label>PRF No</label>
          <input value={prfNo || ""} disabled />
        </div>

        <div className="approve-field">
          <label>Stock Code</label>
          <input value={stockCode || ""} disabled />
        </div>

        <div className="approve-field">
          <label>Stock Name</label>
          <input value={stockName || ""} disabled />
        </div>

        <div className="approve-field">
            <label>Noted By</label>
            <input
              type="text"
              placeholder="Enter name"
              value={notedBy}
              onChange={(e) => setNotedBy(e.target.value)}
            />
        </div>

        <div className="approve-field">
            <label>Verified By</label>
            <input
              type="text"
              placeholder="Enter name"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
            />
        </div>

        <button
          className="approve-button"
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? "Processing..." : "APPROVE"}
        </button>

        {message === "success" && (
          <p className="approve-message success">
            ✅ Stock marked as AVAILABLE successfully.
          </p>
        )}

        {message === "error" && (
          <p className="approve-message error">
            ❌ Error processing approval.
          </p>
        )}
      </div>
    </div>
  );
};

export default StockApproveAvailability;
