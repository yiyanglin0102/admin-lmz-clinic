import React, { useState } from 'react';

const CustomerCard = ({ customer }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="customer-card" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>
          {customer.firstName} {customer.lastName}
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          style={styles.toggleButton}
        >
          {expanded ? '▲ Hide Orders' : '▼ Show Orders'}
        </button>
      </div>

      <div style={styles.details}>
        <p><strong>Username:</strong> {customer.username}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>DoB:</strong> {formatDate(customer.dob)}</p>
        <p><strong>Gender:</strong> {customer.gender}</p>
        <p><strong>Account Created:</strong> {formatDate(customer.accountCreationDate)}</p>
        <p>
          <strong>Address:</strong> {customer.homeAddress.street}, {customer.homeAddress.city}, {customer.homeAddress.state} {customer.homeAddress.zip}
        </p>
      </div>

      {expanded && (
        <div style={styles.ordersSection}>
          {customer.orders.completed.length > 0 && (
            <div style={styles.orderGroup}>
              <h4 style={styles.orderTitle}>✅ Completed Orders</h4>
              <OrderTable orders={customer.orders.completed} />
            </div>
          )}

          {customer.orders.pending.length > 0 && (
            <div style={styles.orderGroup}>
              <h4 style={styles.orderTitle}>⏳ Pending Orders</h4>
              <OrderTable orders={customer.orders.pending} />
            </div>
          )}

          {customer.orders.current.length > 0 && (
            <div style={styles.orderGroup}>
              <h4 style={styles.orderTitle}>🚀 Current Orders</h4>
              <OrderTable orders={customer.orders.current} showComments />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrderTable = ({ orders, showComments = false }) => {
  return (
    <table style={styles.orderTable}>
      <thead>
        <tr>
          <th style={styles.th}>Order ID</th>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Total</th>
          <th style={styles.th}>Status</th>
          {showComments && <th style={styles.th}>Comments</th>}
          <th style={styles.th}>Receipt</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.orderId}>
            <td style={styles.td}>{order.orderId}</td>
            <td style={styles.td}>{new Date(order.date).toLocaleDateString()}</td>
            <td style={styles.td}>${order.total?.toFixed(2)}</td>
            <td style={styles.td}>{order.status}</td>
            {showComments && <td style={styles.td}>{order.comments || "—"}</td>}
            <td style={styles.td}>
              {order.receiptUrl ? (
                <a
                  href={order.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.receiptLink}
                >
                  Download
                </a>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  name: {
    margin: '0',
    color: '#333',
  },
  toggleButton: {
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  details: {
    marginBottom: '12px',
    color: '#555',
  },
  ordersSection: {
    marginTop: '16px',
  },
  orderGroup: {
    marginBottom: '20px',
  },
  orderTitle: {
    margin: '0 0 8px 0',
    color: '#444',
  },
  orderTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    borderBottom: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '8px',
  },
  receiptLink: {
    color: '#2196F3',
    textDecoration: 'none',
  },
};

export default CustomerCard;