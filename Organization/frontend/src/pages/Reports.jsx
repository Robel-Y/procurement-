// src/pages/Reports.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { purchaseRequestService } from "../services/purchaseRequests";
import { userService } from "../services/userService";
import Modal from "../components/Modal";
import Icon from "../components/Icon";

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [activeReport, setActiveReport] = useState("overview");
  const [reportData, setReportData] = useState({
    analytics: {},
    departmentPerformance: [],
    supplierPerformance: [],
    budgetUtilization: [],
  });

  // Unique report data different from dashboard
  const uniqueReportData = {
    departmentPerformance: [
      {
        department: "IT",
        efficiency: 92,
        avgProcessingTime: 1.2,
        budgetUsed: 85,
      },
      {
        department: "Finance",
        efficiency: 88,
        avgProcessingTime: 1.8,
        budgetUsed: 92,
      },
      {
        department: "Operations",
        efficiency: 95,
        avgProcessingTime: 0.9,
        budgetUsed: 78,
      },
      {
        department: "HR",
        efficiency: 85,
        avgProcessingTime: 2.1,
        budgetUsed: 65,
      },
      {
        department: "Marketing",
        efficiency: 90,
        avgProcessingTime: 1.5,
        budgetUsed: 88,
      },
    ],
    supplierPerformance: [
      {
        name: "Tech Supplies Inc.",
        deliveryTime: 2.1,
        quality: 4.8,
        compliance: 95,
      },
      {
        name: "Office Solutions Ltd.",
        deliveryTime: 3.2,
        quality: 4.6,
        compliance: 92,
      },
      {
        name: "Industrial Parts Co.",
        deliveryTime: 4.5,
        quality: 4.4,
        compliance: 88,
      },
      {
        name: "Global Equipment",
        deliveryTime: 2.8,
        quality: 4.2,
        compliance: 85,
      },
      {
        name: "Quality Materials",
        deliveryTime: 3.1,
        quality: 4.1,
        compliance: 90,
      },
    ],
    budgetUtilization: [
      {
        category: "Technology",
        allocated: 500000,
        used: 420000,
        utilization: 84,
      },
      {
        category: "Office Supplies",
        allocated: 200000,
        used: 185000,
        utilization: 92.5,
      },
      {
        category: "Infrastructure",
        allocated: 300000,
        used: 210000,
        utilization: 70,
      },
      { category: "Training", allocated: 100000, used: 75000, utilization: 75 },
      {
        category: "Maintenance",
        allocated: 150000,
        used: 145000,
        utilization: 96.7,
      },
    ],
    costSavings: [
      { month: "Jan", projected: 120000, actual: 135000, savings: 15000 },
      { month: "Feb", projected: 125000, actual: 142000, savings: 17000 },
      { month: "Mar", projected: 130000, actual: 148000, savings: 18000 },
      { month: "Apr", projected: 135000, actual: 155000, savings: 20000 },
      { month: "May", projected: 140000, actual: 162000, savings: 22000 },
      { month: "Jun", projected: 145000, actual: 168000, savings: 23000 },
    ],
  };

  useEffect(() => {
    fetchReportData();
  }, [timeRange, activeReport]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [requestsResponse, usersResponse] = await Promise.all([
        purchaseRequestService.getAll(),
        userService.getUsers(),
      ]);

      // Generate unique analytics for reports (different from dashboard)
      const analytics = generateReportAnalytics(
        requestsResponse.success ? requestsResponse.data : [],
        usersResponse.success ? usersResponse.data : []
      );

      setReportData({
        analytics,
        ...uniqueReportData,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportData({
        analytics: generateReportAnalytics([], []),
        ...uniqueReportData,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReportAnalytics = (requests, users) => {
    // Focus on metrics not shown in dashboard
    const totalRequests = requests.length;
    const avgApprovalTime = 2.5; // This would be calculated from real data
    const costSavings = 125000;
    const complianceRate = 94;
    const supplierSatisfaction = 4.6;

    return {
      totalRequests,
      avgApprovalTime,
      costSavings,
      complianceRate,
      supplierSatisfaction,
      efficiencyScore: 89,
      riskAssessment: "Low",
      sustainabilityScore: 82,
    };
  };

  // Functional button handlers
  const handleExportReport = (type) => {
    // Export CSV for the requested type
    try {
      const csv = buildCSVForType(type || activeReport);
      downloadCSV(csv, `${type || activeReport}-report.csv`);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report. See console for details.");
    }
  };

  const handleGenerateCustomReport = () => {
    setShowCustomModal(true);
  };

  const handleScheduleReport = () => {
    setShowScheduleModal(true);
  };

  const handleRunAudit = () => {
    // Open audit modal
    setShowAuditModal(true);
  };

  // Printable ref for PDF/print export
  const printableRef = useRef();

  const handleExportPDF = () => {
    // Open a new window and write the report HTML for printing
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Popup blocked");

      const content = printableRef.current
        ? printableRef.current.innerHTML
        : document.body.innerHTML;

      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Report - ${activeReport}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid #ddd; padding: 8px; }
              th { background: #f4f4f4; }
            </style>
          </head>
          <body>
            <h1>Report: ${activeReport}</h1>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Optionally close after printing
        // printWindow.close();
      }, 500);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Unable to open print window. Please allow popups and try again.");
    }
  };

  // Helpers for CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const buildCSVForType = (type) => {
    let rows = [];
    if (type === "departments" || type === "departmentPerformance") {
      rows.push([
        "Department",
        "Efficiency",
        "AvgProcessingTime",
        "BudgetUsed",
      ]);
      reportData.departmentPerformance.forEach((d) => {
        rows.push([
          d.department,
          d.efficiency,
          d.avgProcessingTime,
          d.budgetUsed,
        ]);
      });
    } else if (type === "suppliers" || type === "supplierPerformance") {
      rows.push(["Supplier", "DeliveryTime", "Quality", "Compliance"]);
      reportData.supplierPerformance.forEach((s) => {
        rows.push([s.name, s.deliveryTime, s.quality, s.compliance]);
      });
    } else if (type === "budget") {
      rows.push(["Category", "Allocated", "Used", "Utilization"]);
      reportData.budgetUtilization.forEach((b) => {
        rows.push([b.category, b.allocated, b.used, b.utilization]);
      });
    } else if (type === "savings" || type === "costSavings") {
      rows.push(["Month", "Projected", "Actual", "Savings"]);
      (uniqueReportData.costSavings || []).forEach((c) => {
        rows.push([c.month, c.projected, c.actual, c.savings]);
      });
    } else {
      // default overview/analytics
      rows.push(["Metric", "Value"]);
      Object.entries(reportData.analytics || {}).forEach(([k, v]) => {
        rows.push([k, v]);
      });
    }

    // Convert rows to CSV string
    return rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  };

  // Modals state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const handleSubmitCustom = (payload) => {
    // For demo, just alert and close
    alert(`Custom report requested: ${JSON.stringify(payload)}`);
    setShowCustomModal(false);
  };

  const handleSubmitSchedule = (payload) => {
    alert(`Report scheduled: ${JSON.stringify(payload)}`);
    setShowScheduleModal(false);
  };

  const handleConfirmAudit = () => {
    // Simulate running audit
    alert("Audit started. You will be notified when it completes.");
    setShowAuditModal(false);
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="card-header mb-3">
          <h1 className="card-title">Advanced Analytics</h1>
        </div>
        <div className="card text-center p-4">
          <div className="spinner"></div>
          <p>Generating advanced reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card-header mb-3">
        <div className="d-flex justify-between align-center">
          <div>
            <h1 className="card-title mb-1">Advanced Analytics</h1>
            <p style={{ color: "var(--text-light)" }}>
              Deep insights and performance analytics beyond basic metrics
            </p>
          </div>
          <div className="d-flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-select"
              style={{ width: "auto" }}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button onClick={handleExportPDF} className="btn btn-outline">
              <Icon name="printer" size={16} />
              <span style={{ marginLeft: 8 }}>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable area for Export PDF */}
      <div ref={printableRef}>
        {/* Simple printable summary (used by Export PDF) */}
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">Printable Summary</h3>
          </div>
          <div className="p-3">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <strong>Total Requests</strong>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {reportData.analytics.totalRequests || 0}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <strong>Avg Approval Time</strong>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {reportData.analytics.avgApprovalTime || "-"} days
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <strong>Cost Savings</strong>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    ${reportData.analytics.costSavings || 0}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <strong>Compliance</strong>
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {reportData.analytics.complianceRate || "-"}%
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Small sample table: first few departments */}
            <div style={{ marginTop: 12 }}>
              <strong>Top Departments</strong>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: 8,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: 6 }}>
                      Department
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: 6 }}>
                      Efficiency
                    </th>
                    <th style={{ border: "1px solid #ddd", padding: 6 }}>
                      Avg Processing
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.departmentPerformance || [])
                    .slice(0, 5)
                    .map((d) => (
                      <tr key={d.department}>
                        <td style={{ border: "1px solid #ddd", padding: 6 }}>
                          {d.department}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: 6 }}>
                          {d.efficiency}%
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: 6 }}>
                          {d.avgProcessingTime} days
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Navigation */}
      <div className="card mb-4">
        <div className="p-3">
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${
                activeReport === "overview" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveReport("overview")}
            >
              📈 Overview
            </button>
            <button
              className={`btn btn-sm ${
                activeReport === "departments" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveReport("departments")}
            >
              🏢 Department Performance
            </button>
            <button
              className={`btn btn-sm ${
                activeReport === "suppliers" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveReport("suppliers")}
            >
              🤝 Supplier Analytics
            </button>
            <button
              className={`btn btn-sm ${
                activeReport === "budget" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveReport("budget")}
            >
              💰 Budget Analysis
            </button>
            <button
              className={`btn btn-sm ${
                activeReport === "savings" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveReport("savings")}
            >
              💵 Cost Savings
            </button>
          </div>
        </div>
      </div>

      {/* Overview Report */}
      {activeReport === "overview" && (
        <div className="row">
          <div className="col-8">
            <div className="card mb-4">
              <div className="card-header">
                <h3 className="card-title">Performance Metrics</h3>
              </div>
              <div className="p-3">
                <div className="row">
                  <div className="col-6">
                    <div className="metric-card">
                      <div className="metric-value">
                        {reportData.analytics.efficiencyScore}%
                      </div>
                      <div className="metric-label">Process Efficiency</div>
                      <div className="metric-trend">↑ 5% from last month</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-card">
                      <div className="metric-value">
                        {reportData.analytics.complianceRate}%
                      </div>
                      <div className="metric-label">Compliance Rate</div>
                      <div className="metric-trend">↑ 2% from last quarter</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-card">
                      <div className="metric-value">
                        {reportData.analytics.avgApprovalTime}d
                      </div>
                      <div className="metric-label">Avg. Approval Time</div>
                      <div className="metric-trend">↓ 0.3 days improvement</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="metric-card">
                      <div className="metric-value">
                        ${(reportData.analytics.costSavings / 1000).toFixed(0)}K
                      </div>
                      <div className="metric-label">Total Cost Savings</div>
                      <div className="metric-trend">↑ 12% vs target</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Risk & Sustainability</h3>
              </div>
              <div className="p-3">
                <div className="risk-metric">
                  <div className="risk-label">Risk Level</div>
                  <div className="risk-value low">
                    {reportData.analytics.riskAssessment}
                  </div>
                </div>
                <div className="risk-metric">
                  <div className="risk-label">Sustainability Score</div>
                  <div className="risk-value medium">
                    {reportData.analytics.sustainabilityScore}%
                  </div>
                </div>
                <div className="risk-metric">
                  <div className="risk-label">Supplier Satisfaction</div>
                  <div className="risk-value high">
                    {reportData.analytics.supplierSatisfaction}/5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Performance Report */}
      {activeReport === "departments" && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Department Performance Analysis</h3>
          </div>
          <div className="p-3">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Efficiency</th>
                    <th>Avg. Processing</th>
                    <th>Budget Used</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.departmentPerformance.map((dept) => (
                    <tr key={dept.department}>
                      <td>
                        <strong>{dept.department}</strong>
                      </td>
                      <td>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${dept.efficiency}%`,
                              backgroundColor: getEfficiencyColor(
                                dept.efficiency
                              ),
                            }}
                          />
                          <span className="progress-text">
                            {dept.efficiency}%
                          </span>
                        </div>
                      </td>
                      <td>{dept.avgProcessingTime} days</td>
                      <td>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${dept.budgetUsed}%`,
                              backgroundColor: getBudgetColor(dept.budgetUsed),
                            }}
                          />
                          <span className="progress-text">
                            {dept.budgetUsed}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`performance-badge ${getPerformanceClass(
                            dept.efficiency
                          )}`}
                        >
                          {getPerformanceText(dept.efficiency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Functional Action Buttons */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Report Actions</h3>
        </div>
        <div className="p-3">
          <div className="row">
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={() => handleExportReport("detailed")}
              >
                <Icon name="file" size={14} />
                <span style={{ marginLeft: 8 }}>Export Detailed Report</span>
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleGenerateCustomReport}
              >
                <Icon name="zap" size={14} />
                <span style={{ marginLeft: 8 }}>Custom Report</span>
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleScheduleReport}
              >
                <Icon name="calendar" size={14} />
                <span style={{ marginLeft: 8 }}>Schedule Report</span>
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleRunAudit}
              >
                <Icon name="shield" size={14} />
                <span style={{ marginLeft: 8 }}>Run Audit</span>
              </button>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-4">
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleExportReport("executive")}
              >
                <Icon name="award" size={14} />
                <span style={{ marginLeft: 8 }}>Executive Summary</span>
              </button>
            </div>
            <div className="col-4">
              <button
                className="btn btn-warning btn-block"
                onClick={() => handleExportReport("compliance")}
              >
                <Icon name="shield" size={14} />
                <span style={{ marginLeft: 8 }}>Compliance Report</span>
              </button>
            </div>
            <div className="col-4">
              <button
                className="btn btn-success btn-block"
                onClick={() => handleExportReport("performance")}
              >
                <Icon name="bar" size={14} />
                <span style={{ marginLeft: 8 }}>Performance Review</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <Modal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Custom Report Builder"
      >
        <CustomReportForm
          onCancel={() => setShowCustomModal(false)}
          onSubmit={handleSubmitCustom}
        />
      </Modal>

      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Report"
      >
        <ScheduleReportForm
          onCancel={() => setShowScheduleModal(false)}
          onSubmit={handleSubmitSchedule}
        />
      </Modal>

      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Run Audit"
      >
        <div>
          <p>
            Are you sure you want to run a procurement audit now? This may take
            some time.
          </p>
          <div className="d-flex justify-end" style={{ gap: 8 }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowAuditModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirmAudit}>
              Run Audit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper functions
const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 90) return "#10b981";
  if (efficiency >= 80) return "#f59e0b";
  return "#ef4444";
};

const getBudgetColor = (budget) => {
  if (budget >= 90) return "#ef4444";
  if (budget >= 80) return "#f59e0b";
  return "#10b981";
};

const getPerformanceClass = (efficiency) => {
  if (efficiency >= 90) return "excellent";
  if (efficiency >= 80) return "good";
  return "poor";
};

const getPerformanceText = (efficiency) => {
  if (efficiency >= 90) return "Excellent";
  if (efficiency >= 80) return "Good";
  return "Needs Improvement";
};

// Small form components used by modals
const CustomReportForm = ({ onCancel, onSubmit }) => {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("overview");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  return (
    <div>
      <div className="form-group">
        <label>Report Name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Scope</label>
        <select
          className="form-control"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="overview">Overview</option>
          <option value="departments">Departments</option>
          <option value="suppliers">Suppliers</option>
          <option value="budget">Budget</option>
          <option value="savings">Cost Savings</option>
        </select>
      </div>
      <div className="row">
        <div className="col-6">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
        </div>
        <div className="col-6">
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-end" style={{ gap: 8, marginTop: 12 }}>
        <button className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit({ name, scope, start, end })}
        >
          Generate
        </button>
      </div>
    </div>
  );
};

const ScheduleReportForm = ({ onCancel, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [reportType, setReportType] = useState("overview");

  return (
    <div>
      <div className="form-group">
        <label>Email</label>
        <input
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div className="form-group">
        <label>Frequency</label>
        <select
          className="form-control"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="form-group">
        <label>Report Type</label>
        <select
          className="form-control"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="overview">Overview</option>
          <option value="departments">Departments</option>
          <option value="suppliers">Suppliers</option>
          <option value="budget">Budget</option>
        </select>
      </div>
      <div className="d-flex justify-end" style={{ gap: 8, marginTop: 12 }}>
        <button className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit({ email, frequency, reportType })}
        >
          Schedule
        </button>
      </div>
    </div>
  );
};

export default Reports;
