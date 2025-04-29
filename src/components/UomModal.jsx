"use client"

import { useState, useEffect } from "react"
import "../styles/UomModal.css"
import axios from "axios"

const UomModal = ({ onClose, onSelectUom, stockId }) => {
  const [uomList, setUomList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [baseUOM, setBaseUOM] = useState("")

  useEffect(() => {
    const fetchUomCodes = async () => {
      try {
        setLoading(true)

        // If no stockId is provided, fetch all UOMs
        const id = stockId || "all"
        console.log(`UomModal: Fetching UOMCodes for StockId/Code: ${id}`)

        const response = await axios.get(`http://localhost:5000/api/uomcodes/${id}`)
        console.log("UomModal: UOMCodes response:", response.data)

        setUomList(response.data)

        // Set the BaseUOM if available in the first record
        if (response.data.length > 0 && response.data[0].BaseUOM) {
          setBaseUOM(response.data[0].BaseUOM)
        }

        setLoading(false)
      } catch (err) {
        console.error("UomModal: Error fetching UOMCodes:", err)
        setError(`Failed to load UOM codes: ${err.message}`)
        setLoading(false)
      }
    }

    fetchUomCodes()
  }, [stockId])

  const handleSelectUom = (uom) => {
    console.log("UomModal: Selected UOM:", uom)
    onSelectUom(uom.UOMCode)
    onClose()
  }

  return (
    <div className="uom-modal-overlay">
      <div className="uom-modal-container">
        <div className="uom-modal-header">
          <h2>Select Unit of Measure (UOM)</h2>
          <button className="uom-close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="uom-table-container">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <table className="uom-table">
                <thead>
                  <tr>
                    <th>UOM Code</th>
                    <th>Description</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {uomList.length > 0 ? (
                    uomList.map((uom) => (
                      <tr key={uom.Id} onClick={() => handleSelectUom(uom)} className="uom-table-row">
                        <td>{uom.UOMCode}</td>
                        <td>{uom.Description}</td>
                        <td>{uom.Rate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="no-results">
                        No UOM codes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UomModal
