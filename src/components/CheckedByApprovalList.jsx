"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/CooApprovalList.css"
import ApprovalButtonAction from "./ApprovalButtonAction"

const CheckedByApprovalList = () => {
    const [prfs, setPrfs] = useState([])
    const [loading, setLoading] = useState(true)

    const fullName = localStorage.getItem("userFullname")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/pending-checkedby", {
                params: { fullName }
            })
            setPrfs(res.data)
        } catch (error) {
            console.error("Error fetching CheckedBy PRFs:", error)
        } finally {
            setLoading(false)
        }
    }


    const handleAfterAction = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/pending-checkedby")
            setPrfs(res.data)
        } catch (error) {
            console.error("Error refreshing PRFs:", error)
        }
    }

    return (
    <div className="coo-container">
      <div className="coo-header">
        {/* <h2>Checked By Approval List</h2> */}
        <span className="coo-count">{prfs.length} Pending</span>
      </div>

      {loading ? (
        <p className="loading-text">Loading pending PRFs...</p>
      ) : prfs.length === 0 ? (
        <p className="empty-text">No pending PRFs</p>
      ) : (
        <div className="table-wrapper">
          <table className="coo-table">
            <thead>
              <tr>
                <th>PRF No</th>
                <th>Prepared By</th>
                <th>Department Charge</th>
                <th>Stock Name</th>
                <th>Quantity</th>
                <th>UOM</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>

            <tbody>
              {prfs.map((item, index) => (
                <tr key={index}>
                  <td className="prf-no">{item.prfNo}</td>
                  <td>{item.preparedBy}</td>
                  <td>{item.projectCode}</td>
                  <td>{item.StockName}</td>
                  <td>{item.QTY}</td>
                  <td>{item.UOM}</td>
                  <td>
                    <span className="status pending">Pending</span>
                  </td>
                  
                  {/* <td>
                    <ApprovalButtonAction
                        action="approve"
                        assignedAction="approve" 
                        prfId={item.prfId}
                        onAction={handleAfterAction}
                    />
                    </td> */}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

}

export default CheckedByApprovalList