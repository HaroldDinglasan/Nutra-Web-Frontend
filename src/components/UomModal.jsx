import React, { useState, useEffect } from "react"
import "../styles/UomModal.css"

const UomModal = ({ onClose, onSelectUom }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [uomList, setUomList] = useState([
    { id: 1, code: "PCS", description: "Pieces" },
    { id: 2, code: "BOX", description: "Box" },
    { id: 3, code: "BTL", description: "Bottle" },
    { id: 4, code: "KG", description: "Kilogram" },
    { id: 5, code: "G", description: "Gram" },
    { id: 6, code: "L", description: "Liter" },
    { id: 7, code: "ML", description: "Milliliter" },
    { id: 8, code: "PKT", description: "Packet" },
    { id: 9, code: "SET", description: "Set" },
    { id: 10, code: "ROLL", description: "Roll" },
    { id: 11, code: "PACK", description: "Pack" },
    { id: 12, code: "UNIT", description: "Unit" },
  ])
  const [filteredUoms, setFilteredUoms] = useState(uomList)

  useEffect(() => {
    // Filter UOMs based on search term
    const filtered = uomList.filter(
      (uom) =>
        uom.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uom.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUoms(filtered)
  }, [searchTerm, uomList])

  const handleSelectUom = (uom) => {
    onSelectUom(uom.code)
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
        
        <div className="uom-search-container">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="uom-search-input"
          />
        </div>
        
        <div className="uom-table-container">
          <table className="uom-table">
            <thead>
              <tr>
                <th>UOM</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredUoms.map((uom) => (
                <tr key={uom.id} onClick={() => handleSelectUom(uom)} className="uom-table-row">
                  <td>{uom.code}</td>
                  <td>{uom.description}</td>
                </tr>
              ))}
              {filteredUoms.length === 0 && (
                <tr>
                  <td colSpan="2" className="no-results">No UOMs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UomModal
