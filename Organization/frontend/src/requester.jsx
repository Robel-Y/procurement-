import React, { useState } from 'react';
import './requester.css';

const A = false;


export function RequesterDashboard(){
  const [activeTab, setActiveTab] = useState('catalog');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - in real app, this would come from API
  const catalogItems = [
    { id: 1, name: 'Laptop Dell XPS 13', category: 'IT Hardware', price: 1200, supplier: 'Tech Supplier Inc.', image: '/images/laptop.jpg' },
    { id: 2, name: 'Office Chair Ergonomic', category: 'Office Furniture', price: 350, supplier: 'Office Works', image: '/images/chair.jpg' },
    { id: 3, name: 'Notebooks Pack of 10', category: 'Office Supplies', price: 25, supplier: 'Supply Pro', image: '/images/notebooks.jpg' },
    { id: 4, name: 'Web Development Service', category: 'Professional Services', price: 5000, supplier: 'Dev Solutions', image: '/images/services.jpg' },
  ];

  const myRequisitions = [
    { id: 'REQ-001', date: '2024-01-15', items: ['Laptop Dell XPS 13'], total: 1200, status: 'Approved', approvedBy: 'John Manager' },
    { id: 'REQ-002', date: '2024-01-18', items: ['Office Chair'], total: 350, status: 'Pending Approval', approvedBy: '-' },
    { id: 'REQ-003', date: '2024-01-20', items: ['Notebooks', 'Pens'], total: 45, status: 'Rejected', approvedBy: 'Jane Director' },
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Approved': 'status-approved',
      'Pending Approval': 'status-pending',
      'Rejected': 'status-rejected',
      'Draft': 'status-draft'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status}</span>;
  };

  const filteredItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    (A && 
    
    <div className="requester-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Procurement Portal</h1>
        <div className="user-info">
          <span>Welcome, Sarah Johnson</span>
          <div className="notification-bell">🔔</div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>My Requisitions</h3>
          <div className="stat-number">12</div>
        </div>
        <div className="stat-card">
          <h3>Pending Approval</h3>
          <div className="stat-number">3</div>
        </div>
        <div className="stat-card">
          <h3>Items in Cart</h3>
          <div className="stat-number">{cart.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button 
          className={`tab-button ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          Product Catalog
        </button>
        <button 
          className={`tab-button ${activeTab === 'my-requisitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requisitions')}
        >
          My Requisitions
        </button>
        <button 
          className={`tab-button ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          Shopping Cart ({cart.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Product Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="catalog-tab">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-button">Search</button>
            </div>

            <div className="catalog-grid">
              {filteredItems.map(item => (
                <div key={item.id} className="catalog-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category}</p>
                    <p className="item-supplier">Supplier: {item.supplier}</p>
                    <p className="item-price">${item.price}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Requisitions Tab */}
        {activeTab === 'my-requisitions' && (
          <div className="requisitions-tab">
            <div className="table-container">
              <table className="requisitions-table">
                <thead>
                  <tr>
                    <th>Requisition ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequisitions.map(req => (
                    <tr key={req.id}>
                      <td className="req-id">{req.id}</td>
                      <td>{req.date}</td>
                      <td>{req.items.join(', ')}</td>
                      <td>${req.total}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>{req.approvedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shopping Cart Tab */}
        {activeTab === 'cart' && (
          <div className="cart-tab">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Browse the product catalog to add items to your cart.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.cartId} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>{item.category} • {item.supplier}</p>
                      </div>
                      <div className="cart-item-price">${item.price}</div>
                      <button 
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.cartId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  Total: ${cart.reduce((sum, item) => sum + item.price, 0)}
                </div>
                <div className="cart-actions">
                  <button className="secondary-btn">Save as Draft</button>
                  <button className="primary-btn">Submit for Approval</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    )
  );
};

