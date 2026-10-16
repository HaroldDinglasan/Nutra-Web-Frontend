"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/CooApprovalList.css"
import ApprovalButtonAction from "./ApprovalButtonAction"

const ExecutiveApprovalList = () => {
  const [prfs, setPrfs] = useState([])
  const [loading, setLoading] = useState(true)

  const fullName = localStorage.getItem("userFullname") || ""

  const fetchPendingPrfs = async () => {

    console.log("FULLNAME:", fullName)

    try{

      const res = await axios.get(
        "http://localhost:5000/api/pending-coo",
        {
          params:{
            approvedBy: fullName
          }
        }
      )

      setPrfs(res.data)

    }catch(error){

      console.error(error)

    }finally{

      setLoading(false)

    }

  }

  useEffect(()=>{

    fetchPendingPrfs()

    console.log("Logged in fullname:", fullName)


  },[])


  const handleAfterAction = () => {

    fetchPendingPrfs()
  }
  

  return (
    <div className="coo-container">
      <div className="coo-header">
        <h2>Approval List</h2>
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
                <th>Purpose</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {prfs.map((item, index) => (
                <tr key={index}>
                  <td className="prf-no" data-label="PRF No">{item.prfNo}</td>
                  <td data-label="Prepared By">{item.preparedBy}</td>
                  <td data-label="Department Charge">{item.projectCode}</td>
                  <td data-label="Stock Name">{item.StockName}</td>
                  <td data-label="Quantity">{item.QTY}</td>
                  <td data-label="UOM">{item.UOM}</td>
                  <td data-label="Purpose">{item.Purpose}</td>
                  <td data-label="Status">
                    <span className="status pending">Pending</span>
                  </td>
                  <td className="action-cell">
                    <ApprovalButtonAction
                      action="approve"
                      assignedAction="approve"
                      prfId={item.prfId}
                      checkedByStatus={item.checkedBy_Status}
                      departmentType={item.departmentType}
                      onAction={handleAfterAction}
                    />
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ExecutiveApprovalList