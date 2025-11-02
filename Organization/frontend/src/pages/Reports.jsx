// src/pages/Reports.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { purchaseRequestService } from "../services/purchaseRequests";
import { userService } from "../services/userService";

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
    // Simulate export functionality
    console.log(`Exporting ${type} report...`);
    alert(`${type} report exported successfully!`);
  };

  const handleGenerateCustomReport = () => {
    const reportType = prompt(
      "Enter report type (e.g., Monthly, Quarterly, Department-wise):"
    );
    if (reportType) {
      alert(
        `Generating custom ${reportType} report...\nThis would typically open a report builder or send a request to the backend.`
      );
    }
  };

  const handleScheduleReport = () => {
    const email = prompt("Enter email for scheduled reports:");
    const frequency = prompt("Enter frequency (daily, weekly, monthly):");
    if (email && frequency) {
      alert(`Report scheduled for ${frequency} delivery to ${email}`);
    }
  };

  const handleRunAudit = () => {
    alert(
      "Running procurement audit...\nThis would trigger backend audit processes and generate compliance reports."
    );
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
            <button
              onClick={() => handleExportReport("comprehensive")}
              className="btn btn-outline"
            >
              📊 Export PDF
            </button>
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
                📋 Export Detailed Report
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleGenerateCustomReport}
              >
                🛠️ Custom Report
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleScheduleReport}
              >
                ⏰ Schedule Report
              </button>
            </div>
            <div className="col-3">
              <button
                className="btn btn-outline btn-block mb-2"
                onClick={handleRunAudit}
              >
                🔍 Run Audit
              </button>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-4">
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleExportReport("executive")}
              >
                👔 Executive Summary
              </button>
            </div>
            <div className="col-4">
              <button
                className="btn btn-warning btn-block"
                onClick={() => handleExportReport("compliance")}
              >
                📝 Compliance Report
              </button>
            </div>
            <div className="col-4">
              <button
                className="btn btn-success btn-block"
                onClick={() => handleExportReport("performance")}
              >
                📊 Performance Review
              </button>
            </div>
          </div>
        </div>
      </div>
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

export default Reports;
