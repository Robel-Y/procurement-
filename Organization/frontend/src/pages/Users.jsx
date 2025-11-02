import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import Modal from "../components/Modal";
import UserRegistration from "./UserRegistration";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userService.getUsers();
      if (res.success) {
        // API returns paginated data in some projects; support both shapes
        const data = res.data?.data || res.data || [];
        setUsers(Array.isArray(data) ? data : data.items || []);
      } else {
        setError(res.error || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header mb-3">
        <h1 className="card-title mb-1">User Management</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowRegisterModal(true)}
          >
            Register New User
          </button>
          <button className="btn btn-outline" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-3">
          {loading ? (
            <div>Loading users...</div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.id || u.email}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.department}</td>
                      <td>{u.phone || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Register modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New User"
        size="md"
      >
        <UserRegistration
          onSuccess={() => {
            setShowRegisterModal(false);
            fetchUsers();
          }}
        />
      </Modal>
    </div>
  );
};

export default Users;
