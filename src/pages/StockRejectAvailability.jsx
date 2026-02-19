import { useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/StockRejectAvailability.css";

const StockRejectAvailability = () => {
  
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
  const [rejectionReason, setRejectionReason] = useState("");

  // State for loading (when button is clicked)
  const [loading, setLoading] = useState(false);

  // State for success or error message
  const [message, setMessage] = useState("");

  // Function that runs when APPROVE button is clicked
  const handleReject = async () => {
    if (!notedBy || !verifiedBy) {
        setMessage("required");
        return;
    }


    try {
      setLoading(true);

      // Call backend API to approve the stock
      await fetch(
        `http://localhost:5000/api/cgs-stock/reject`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prfId,
                stockCode,
                stockName,
                checkerName,
                notedBy,
                verifiedBy,
                rejectionReason,
            }),
        }
      );

      setMessage("success");
    } catch (error) {
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

        <div className="reject-field">
          <label>Stock Code</label>
          <input value={stockCode || ""} disabled />
        </div>

        <div className="reject-field">
          <label>Stock Name</label>
          <input value={stockName || ""} disabled />
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

        <div className="reject-field">
            <label>Noted By</label>
            <input
              type="text"
              placeholder="Enter name"
              value={notedBy}
              onChange={(e) => setNotedBy(e.target.value)}
            />
        </div>

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
  );
};

export default StockRejectAvailability;
