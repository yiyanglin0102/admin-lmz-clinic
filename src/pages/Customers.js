import React from 'react';
import CustomerCard from './CustomerCard';
import customerData from '../sample_data/sample_customers.js';

function Customer() {
  return (
    <div className="customer-dashboard">
      <h1>Customer Management</h1>
      {customerData.customers.map(customer => ( // Access .customers
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}

export default Customer;