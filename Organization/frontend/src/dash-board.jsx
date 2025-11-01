import React, { useState } from 'react';
import './dash-board.css';
import Sidebar from './side-bar';


export const ApproverDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in real app, this would come from API
  const pendingSuppliers = [
    {
      id: 'SUP-001',
      companyName: 'Tech Solutions Inc.',
      contactPerson: 'John Smith',
      email: 'john@techsolutions.com',
      phone: '+1 (555) 123-4567',
      registrationDate: '2024-01-15',
      businessType: 'IT Services',
      annualRevenue: '$5.2M',
      employees: 45,
      documents: ['Business License.pdf', 'Tax Certificate.pdf', 'Insurance.pdf'],
      riskLevel: 'Low',
      submittedDate: '2024-01-20'
    },
    {
      id: 'SUP-002',
      companyName: 'Global Office Supplies',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@globaloffice.com',
      phone: '+1 (555) 987-6543',
      registrationDate: '2024-01-10',
      businessType: 'Office Supplies',
      annualRevenue: '$2.8M',
      employees: 28,
      documents: ['Business License.pdf', 'Tax Certificate.pdf'],
      riskLevel: 'Medium',
      submittedDate: '2024-01-18'
    },
    {
      id: 'SUP-003',
      companyName: 'Elite Construction Ltd.',
      contactPerson: 'Mike Wilson',
      email: 'mike@eliteconstruction.com',
      phone: '+1 (555) 456-7890',
      registrationDate: '2023-12-20',
      businessType: 'Construction',
      annualRevenue: '$8.5M',
      employees: 120,
      documents: ['Business License.pdf', 'Safety Certificate.pdf', 'Insurance.pdf', 'References.pdf'],
      riskLevel: 'Low',
      submittedDate: '2024-01-22'
    }
  ];

  const approvedSuppliers = [
    {
      id: 'SUP-004',
      companyName: 'Quality IT Hardware',
      contactPerson: 'Lisa Brown',
      email: 'lisa@qualityit.com',
      approvedDate: '2024-01-10',
      approvedBy: 'David Wilson',
      businessType: 'IT Hardware',
      status: 'Active'
    },
    {
      id: 'SUP-005',
      companyName: 'Premium Office Furniture',
      contactPerson: 'Robert Taylor',
      email: 'robert@premiumfurniture.com',
      approvedDate: '2024-01-05',
      approvedBy: 'David Wilson',
      businessType: 'Furniture',
      status: 'Active'
    }
  ];

  const rejectedSuppliers = [
    {
      id: 'SUP-006',
      companyName: 'Quick Services Co.',
      contactPerson: 'James Miller',
      email: 'james@quickservices.com',
      rejectedDate: '2024-01-12',
      rejectedBy: 'David Wilson',
      businessType: 'Services',
      reason: 'Incomplete documentation'
    }
  ];

  const dashboardStats = {
    pendingApprovals: pendingSuppliers.length,
    totalApproved: approvedSuppliers.length,
    totalRejected: rejectedSuppliers.length,
    approvalRate: '85%',
    avgProcessingTime: '2.3 days'
  };

  const handleApprove = (supplierId) => {
    // API call to approve supplier
    console.log('Approving supplier:', supplierId);
    alert(`Supplier ${supplierId} approved successfully!`);
  };

  const handleReject = (supplierId, reason) => {
    // API call to reject supplier
    const rejectReason = prompt('Please enter rejection reason:');
    if (rejectReason) {
      console.log('Rejecting supplier:', supplierId, 'Reason:', rejectReason);
      alert(`Supplier ${supplierId} rejected.`);
    }
  };

  const getRiskBadge = (riskLevel) => {
    const riskClasses = {
      'Low': 'risk-low',
      'Medium': 'risk-medium',
      'High': 'risk-high'
    };
    return <span className={`risk-badge ${riskClasses[riskLevel]}`}>{riskLevel}</span>;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'status-active',
      'Pending': 'status-pending',
      'Rejected': 'status-rejected',
      'Suspended': 'status-suspended'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  const filteredSuppliers = pendingSuppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="approver-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Supplier Approval Dashboard</h1>
          <div className="user-info">
            <span>Welcome, Approver</span>
            <div className="notification-bell">🔔 <span className="notification-count">{pendingSuppliers.length}</span></div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending Approvals</h3>
              <div className="stat-number">{dashboardStats.pendingApprovals}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Total Approved</h3>
              <div className="stat-number">{dashboardStats.totalApproved}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>Total Rejected</h3>
              <div className="stat-number">{dashboardStats.totalRejected}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Approval Rate</h3>
              <div className="stat-number">{dashboardStats.approvalRate}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>Avg. Processing Time</h3>
              <div className="stat-number">{dashboardStats.avgProcessingTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approval ({pendingSuppliers.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Suppliers ({approvedSuppliers.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected Suppliers ({rejectedSuppliers.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Search and Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search suppliers by name, contact, or business type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
          <div className="filter-options">
            <select className="filter-select">
              <option>All Business Types</option>
              <option>IT Services</option>
              <option>Office Supplies</option>
              <option>Construction</option>
              <option>IT Hardware</option>
            </select>
            <select className="filter-select">
              <option>All Risk Levels</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="suppliers-list">
            <h2>Pending Supplier Approvals</h2>
            <div className="suppliers-grid">
              {filteredSuppliers.map(supplier => (
                <div key={supplier.id} className="supplier-card">
                  <div className="supplier-header">
                    <h3>{supplier.companyName}</h3>
                    {getRiskBadge(supplier.riskLevel)}
                  </div>
                  <div className="supplier-details">
                    <div className="detail-row">
                      <span className="label">Contact:</span>
                      <span className="value">{supplier.contactPerson}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{supplier.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span className="value">{supplier.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Business Type:</span>
                      <span className="value">{supplier.businessType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Annual Revenue:</span>
                      <span className="value">{supplier.annualRevenue}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Employees:</span>
                      <span className="value">{supplier.employees}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{supplier.submittedDate}</span>
                    </div>
                  </div>
                  <div className="documents-section">
                    <h4>Documents:</h4>
                    <div className="documents-list">
                      {supplier.documents.map((doc, index) => (
                        <a key={index} href="#" className="document-link">📄 {doc}</a>
                      ))}
                    </div>
                  </div>
                  <div className="supplier-actions">
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(supplier.id)}
                    >
                      Reject
                    </button>
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(supplier.id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Suppliers Tab */}
        {activeTab === 'approved' && (
          <div className="suppliers-table-section">
            <h2>Approved Suppliers</h2>
            <div className="table-container">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Supplier ID</th>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Business Type</th>
                    <th>Approved Date</th>
                    <th>Approved By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedSuppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td className="supplier-id">{supplier.id}</td>
                      <td>{supplier.companyName}</td>
                      <td>{supplier.contactPerson}</td>
                      <td>{supplier.businessType}</td>
                      <td>{supplier.approvedDate}</td>
                      <td>{supplier.approvedBy}</td>
                      <td>{getStatusBadge(supplier.status)}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn suspend">Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rejected Suppliers Tab */}
        {activeTab === 'rejected' && (
          <div className="suppliers-table-section">
            <h2>Rejected Suppliers</h2>
            <div className="table-container">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Supplier ID</th>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Business Type</th>
                    <th>Rejected Date</th>
                    <th>Rejected By</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedSuppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td className="supplier-id">{supplier.id}</td>
                      <td>{supplier.companyName}</td>
                      <td>{supplier.contactPerson}</td>
                      <td>{supplier.businessType}</td>
                      <td>{supplier.rejectedDate}</td>
                      <td>{supplier.rejectedBy}</td>
                      <td className="rejection-reason">{supplier.reason}</td>
                      <td>
                        <button className="action-btn view">View</button>
                        <button className="action-btn reconsider">Reconsider</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activity Sidebar */}
        <div className="activity-sidebar">
          <h3>Recent Approval Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p><strong>Quality IT Hardware</strong> was approved</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">❌</div>
              <div className="activity-content">
                <p><strong>Quick Services Co.</strong> was rejected</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📥</div>
              <div className="activity-content">
                <p><strong>Elite Construction Ltd.</strong> submitted for approval</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p><strong>Premium Office Furniture</strong> was approved</p>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};