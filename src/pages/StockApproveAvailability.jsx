import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/StockApproveAvailability.css";
  
const StockApproveAvailability = () => {
  
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

  const [rejectionReason, setRejectionReason] = useState("");

  const [stockItems, setStockItems] = useState([]);

  const checkerName = params.get("checkerName");

  const [notedBy, setNotedBy] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");

  const [loading, setLoading] = useState(false);
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
  const handleApprove = async () => {
    if (!verifiedBy) {
      alert("Please fill in Verified By.");
      return;
    }

    try {
      setLoading(true);

      // If multiple items → APPROVE ALL
      if (stockItems.length > 0) {
        for (const item of stockItems) {
          await fetch("http://localhost:5000/api/cgs-stock/approve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prfId,
              stockCode: item.stockCode,
              stockName: item.stockName,
              reason: rejectionReason,
              verifiedBy,
            }),
          });
        }

        alert("All stocks marked as AVAILABLE.");

        // ✅ CLEAR ALL FIELDS (after success)
        setStockItems([]);
        setNotedBy("");
        setVerifiedBy("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setRejectionReason("");
        setPrfNo("");

        setMessage("success");

      } else {
        // Single approve
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
              reason: rejectionReason,
              verifiedBy,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        alert("Stock marked as AVAILABLE successfully.");

        // ✅ CLEAR ALL FIELDS (after success)
        setStockItems([]);
        setNotedBy("");
        setVerifiedBy("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setRejectionReason("");
        setPrfNo("");

        setMessage("success");
      }

    } catch (error) {
      alert("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Function that runs when REJECT button is clicked
  const handleReject = async () => {
    if (!verifiedBy) {
      alert("Please fill in Verified By.");
      return;
    }

    try {
      setLoading(true);

      // Multiple items
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
              reason: rejectionReason,
              verifiedBy,
              rejectType: "wrong-stock-code",
            }),
          });
        }

        alert("All stocks marked as NOT AVAILABLE.");

        // Clear fields
        setStockItems([]);
        setNotedBy("");
        setVerifiedBy("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setRejectionReason("");
        setPrfNo("");

        setMessage("reject-success");

      } else {
        // Single item
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
              reason: rejectionReason,
              verifiedBy,
              rejectType: "wrong-stock-code",

            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
          return;
        }

        alert("Stock marked as NOT AVAILABLE successfully.");

        // Clear fields
        setStockItems([]);
        setNotedBy("");
        setVerifiedBy("");
        setPrfId("");
        setStockCode("");
        setStockName("");
        setRejectionReason("");
        setPrfNo("");

        setMessage("reject-success");
      }

    } catch (error) {
      alert("Server error occurred.");
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="approve-page">
      <div className="approve-card">
        <h2 className="reject-title">Stock Availability Review</h2>

        <div className="approve-field">
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
            <label>Remarks: </label>
            <input
              type="text"
              placeholder=""
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              />
        </div>

        <div className="approve-footer">

          <div className="approve-field">
              <label>Verified By:</label>
              <input
                type="text"
                placeholder="Enter name"
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
              />
          </div>

          <div className="button-group">
            <button
              className="approve-button"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? "Processing..." : "APPROVE"}
            </button>

            <button
              className="reject-button"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? "Processing..." : "REJECT"}
            </button>
          </div>

          {message === "success" && (
            <p className="approve-message success">
              ✅ Stock marked as AVAILABLE successfully.
            </p>
          )}

          {message === "reject-success" && (
            <p className="approve-message error">
              ⚠️ Stock marked as NOT AVAILABLE successfully.
            </p>
          )}

          {message === "error" && (
            <p className="approve-message error">
              ❌ Error processing approval.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};

export default StockApproveAvailability;
