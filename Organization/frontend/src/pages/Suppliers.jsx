import React, { useState, useEffect } from "react";
import { supplierService } from "../services/suppliers";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const response = await supplierService.getAll();
    if (response.success) {
      setSuppliers(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner" style={{ margin: "2rem auto" }} />
        <p>Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header mb-3">
        <h1 className="card-title mb-0">Suppliers</h1>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Delivery Score</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.companyName}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>
                  <div className="d-flex align-center gap-1">
                    <span>{supplier.rating}</span>
                    <span>⭐</span>
                  </div>
                </td>
                <td>{supplier.deliveryScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;
