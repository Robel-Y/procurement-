// Add this to your PurchaseRequestDetails component to handle edit functionality
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const PurchaseRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check if we're in edit mode from URL parameter
    const editParam = searchParams.get("edit");
    setIsEditMode(editParam === "true");
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await purchaseRequestService.getById(id);

      if (response.success) {
        setRequest(response.data);
      } else {
        setError("Failed to load request details");
      }
    } catch (err) {
      setError("Error loading request details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await purchaseRequestService.update(id, updatedData);
      if (response.success) {
        setRequest(response.data);
        setIsEditMode(false);
      } else {
        setError("Failed to update request");
      }
    } catch (err) {
      setError("Error updating request");
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div>
          <h1 className="card-title mb-1">
            {isEditMode ? "Edit Request" : "Request Details"}
          </h1>
          <p style={{ color: "var(--text-light)" }}>{request.title}</p>
        </div>

        {/* Edit/Save buttons */}
        {request.status === "draft" && (
          <div className="d-flex gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                  Save Changes
                </button>
              </>
            ) : (
              <button onClick={handleEditToggle} className="btn btn-outline">
                ✏️ Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rest of your component with edit form or view mode */}
    </div>
  );
};

export default PurchaseRequestDetails;
