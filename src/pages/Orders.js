import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { sampleOrdersData } from '../sample_data/sample_OrdersData.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulate fetching data
    setOrders(sampleOrdersData);
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Orders Dashboard
      </Typography>

      <TableContainer component={Paper}>
        <Table aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Items</strong></TableCell>
              <TableCell><strong>Total ($)</strong></TableCell>
              <TableCell><strong>Payment</strong></TableCell>
              <TableCell><strong>Channel</strong></TableCell>
              <TableCell><strong>Note</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.quantity}× {item.name}
                    </div>
                  ))}
                </TableCell>
                <TableCell>{order.total.toFixed(2)}</TableCell>
                <TableCell>{order.paymentStatus}</TableCell>
                <TableCell>{order.channel}</TableCell>
                <TableCell>{order.note || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders;
