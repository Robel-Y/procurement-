import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { purchaseRequestService } from "../services/purchaseRequests";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const CreatePurchaseRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    urgency: "medium",
    items: [{ name: "", quantity: 1, unitPrice: "", total: 0 }],
    vendorRecommendations: [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    // Update the field
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total if quantity or unitPrice changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity"
          ? parseInt(value) || 0
          : parseInt(updatedItems[index].quantity) || 0;
      const unitPrice =
        field === "unitPrice"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].total = quantity * unitPrice;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));

    // Recalculate total budget
    const totalBudget = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    setFormData((prev) => ({ ...prev, budget: totalBudget.toFixed(2) }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, unitPrice: "", total: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: updatedItems }));

      // Recalculate budget after removal
      const totalBudget = updatedItems.reduce(
        (sum, item) => sum + (item.total || 0),
        0
      );
      setFormData((prev) => ({ ...prev, budget: totalBudget.toFixed(2) }));
    }
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.category) {
      setError("Category is required");
      return false;
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError("Valid budget is required");
      return false;
    }

    // Items validation
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.name.trim()) {
        setError(`Item ${i + 1} name is required`);
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        setError(`Item ${i + 1} quantity must be at least 1`);
        return false;
      }
      if (!item.unitPrice || parseFloat(item.unitPrice) < 0) {
        setError(`Item ${i + 1} unit price must be a positive number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate total quantity from all items
      const totalQuantity = formData.items.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0
      );

      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: parseFloat(formData.budget),
        urgency: formData.urgency,
        quantity: totalQuantity, // <-- top-level quantity
        items: formData.items.map((item) => ({
          name: item.name.trim(),
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total),
        })),
        vendorRecommendations: Array.isArray(formData.vendorRecommendations)
          ? formData.vendorRecommendations
          : formData.vendorRecommendations
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v),
        status: "draft",
        department: user.department,
      };

      console.log("Sending data to API:", requestData);

      const response = await purchaseRequestService.create(requestData);

      if (response.success) {
        console.log("Purchase request created successfully:", response.data);
        navigate("/purchase-requests");
      } else {
        setError(response.error || "Failed to create purchase request");
      }
    } catch (err) {
      setError("An error occurred while creating the request: " + err.message);
      console.error("Create request error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Calculate totals
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (item.total || 0),
    0
  );
  const tax = subtotal * 0.1; // 10% tax for example
  const grandTotal = subtotal + tax;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create Purchase Request</h1>
        <p style={styles.subtitle}>
          Create a new purchase request for {user?.department} department
        </p>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <div style={styles.errorContent}>
            <strong>Error:</strong> {error}
            <button onClick={() => setError("")} style={styles.closeButton}>
              ×
            </button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.formSection}>
            {/* Basic Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Basic Information</h3>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="title">
                  Title <span style={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter a clear, descriptive title for your request"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="description">
                  Description <span style={styles.required}>*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  disabled={loading}
                  rows="4"
                  placeholder="Describe what you need to purchase, why it's needed, and any specific requirements..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.grid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="category">
                    Category <span style={styles.required}>*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    required
                    disabled={loading}
                    style={styles.select}
                  >
                    <option value="">Select a category</option>
                    <option value="office-supplies">🖊️ Office Supplies</option>
                    <option value="equipment">💻 Equipment</option>
                    <option value="software">🔧 Software</option>
                    <option value="services">👥 Services</option>
                    <option value="furniture">🪑 Furniture</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="travel">✈️ Travel</option>
                    <option value="training">🎓 Training</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="urgency">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    value={formData.urgency}
                    onChange={(e) => handleChange("urgency", e.target.value)}
                    disabled={loading}
                    style={styles.select}
                  >
                    <option value="low">🟢 Low (Within 30 days)</option>
                    <option value="medium">🟡 Medium (Within 14 days)</option>
                    <option value="high">🟠 High (Within 7 days)</option>
                    <option value="critical">
                      🔴 Critical (Within 48 hours)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>📦 Items Requested</h3>
                <button
                  type="button"
                  onClick={addItem}
                  style={styles.addButton}
                  disabled={loading}
                >
                  + Add Item
                </button>
              </div>

              <div style={styles.itemsContainer}>
                {formData.items.map((item, index) => (
                  <div key={index} style={styles.itemCard}>
                    <div style={styles.itemHeader}>
                      <span style={styles.itemNumber}>Item #{index + 1}</span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          style={styles.removeButton}
                          disabled={loading}
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>

                    <div style={styles.itemGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Laptop, Printer, Software License"
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Quantity</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Unit Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, "unitPrice", e.target.value)
                          }
                          disabled={loading}
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Total</label>
                        <div style={styles.totalDisplay}>
                          ${(item.total || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Summary */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💰 Budget Summary</h3>
              <div style={styles.budgetCard}>
                <div style={styles.budgetRow}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={styles.budgetRow}>
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ ...styles.budgetRow, ...styles.grandTotal }}>
                  <span>
                    <strong>Grand Total:</strong>
                  </span>
                  <span>
                    <strong>${grandTotal.toFixed(2)}</strong>
                  </span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="budget">
                    Total Budget <span style={styles.required}>*</span>
                  </label>
                  <input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    required
                    disabled={loading}
                    placeholder="0.00"
                    style={styles.budgetInput}
                  />
                </div>
              </div>
            </div>

            {/* Vendor Recommendations */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏢 Vendor Recommendations</h3>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="vendorRecommendations">
                  Preferred Vendors (Optional)
                </label>
                <textarea
                  id="vendorRecommendations"
                  value={
                    Array.isArray(formData.vendorRecommendations)
                      ? formData.vendorRecommendations.join(", ")
                      : formData.vendorRecommendations
                  }
                  onChange={(e) =>
                    handleChange(
                      "vendorRecommendations",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                  disabled={loading}
                  rows="3"
                  placeholder="List preferred vendors separated by commas. Example: Amazon Business, Office Depot, Dell Technologies"
                  style={styles.textarea}
                />
                <div style={styles.helperText}>
                  💡 Including vendor recommendations can speed up the
                  procurement process
                </div>
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/purchase-requests")}
                style={styles.cancelButton}
                disabled={loading}
              >
                ← Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Creating...
                  </>
                ) : (
                  "✅ Create Request"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div style={styles.helpCard}>
        <h3 style={styles.helpTitle}>💡 Need Help?</h3>
        <div style={styles.helpGrid}>
          <div>
            <h4>Best Practices</h4>
            <ul style={styles.helpList}>
              <li>Provide detailed item descriptions</li>
              <li>Include product links if available</li>
              <li>Specify exact quantities needed</li>
              <li>Add vendor contact information</li>
            </ul>
          </div>
          <div>
            <h4>Quick Tips</h4>
            <ul style={styles.helpList}>
              <li>Set realistic urgency levels</li>
              <li>Double-check budget calculations</li>
              <li>Include business justification</li>
              <li>Review before submitting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comprehensive inline CSS styles
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: "30px",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    color: "white",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 8px 0",
    background: "linear-gradient(45deg, #fff, #f0f0f0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: "0.9",
    margin: "0",
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "24px",
    overflow: "hidden",
  },
  formSection: {
    padding: "32px",
  },
  section: {
    marginBottom: "32px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "6px",
  },
  required: {
    color: "#e53e3e",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    resize: "vertical",
    minHeight: "100px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s ease",
    background: "white",
    boxSizing: "border-box",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  itemCard: {
    padding: "20px",
    border: "2px solid #edf2f7",
    borderRadius: "8px",
    background: "white",
    transition: "all 0.2s ease",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  itemNumber: {
    fontWeight: "600",
    color: "#4a5568",
  },
  itemGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "16px",
  },
  totalDisplay: {
    padding: "12px 16px",
    background: "#f7fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  budgetCard: {
    padding: "20px",
    background: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    maxWidth: "400px",
  },
  budgetRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  grandTotal: {
    borderTop: "2px solid #cbd5e0",
    borderBottom: "none",
    paddingTop: "12px",
    marginTop: "8px",
    fontSize: "1.1rem",
  },
  budgetInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #48bb78",
    borderRadius: "8px",
    fontSize: "1.2rem",
    fontWeight: "600",
    background: "#f0fff4",
    color: "#2f855a",
    marginTop: "12px",
    boxSizing: "border-box",
  },
  addButton: {
    padding: "10px 20px",
    background: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  removeButton: {
    padding: "6px 12px",
    background: "#fed7d7",
    color: "#c53030",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    padding: "24px 32px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButton: {
    padding: "12px 24px",
    background: "transparent",
    color: "#4a5568",
    border: "2px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitButton: {
    padding: "12px 32px",
    background: "linear-gradient(135deg, #48bb78, #38a169)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorAlert: {
    background: "#fed7d7",
    color: "#c53030",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid #feb2b2",
  },
  errorContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#c53030",
  },
  helperText: {
    fontSize: "0.875rem",
    color: "#718096",
    marginTop: "6px",
    fontStyle: "italic",
  },
  helpCard: {
    background: "linear-gradient(135deg, #fff5f5, #fed7d7)",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #fed7d7",
  },
  helpTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#742a2a",
    marginBottom: "20px",
  },
  helpGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  helpList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#742a2a",
  },
};

// Add hover effects
Object.assign(styles.input, {
  ":focus": {
    borderColor: "#4299e1",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
    outline: "none",
  },
});

Object.assign(styles.textarea, {
  ":focus": {
    borderColor: "#4299e1",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
    outline: "none",
  },
});

Object.assign(styles.select, {
  ":focus": {
    borderColor: "#4299e1",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
    outline: "none",
  },
});

Object.assign(styles.addButton, {
  ":hover": {
    background: "#3182ce",
    transform: "translateY(-1px)",
  },
});

Object.assign(styles.removeButton, {
  ":hover": {
    background: "#feb2b2",
  },
});

Object.assign(styles.cancelButton, {
  ":hover": {
    background: "#e2e8f0",
    borderColor: "#a0aec0",
  },
});

Object.assign(styles.submitButton, {
  ":hover": {
    background: "linear-gradient(135deg, #38a169, #2f855a)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(72, 187, 120, 0.3)",
  },
});

export default CreatePurchaseRequest;
