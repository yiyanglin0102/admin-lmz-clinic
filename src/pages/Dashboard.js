import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider, 
  CircularProgress, Avatar, Chip, Badge
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import sampleTransactions from '../sample_data/sample_Transactions';
import customerData from '../sample_data/sample_customers';
import { ArrowUpward, LocalShipping, ShoppingCart, Payment } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [processedData, setProcessedData] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process transaction data
    const processData = (transactions) => {
      const data = {
        dailySales: {},
        paymentMethods: {},
        topItems: {},
        hourlySales: Array(24).fill(0).map((_, i) => ({ hour: i, sales: 0 })),
        tipsData: { total: 0, byMethod: {} },
        refunds: 0,
        taxes: { included: 0, excluded: 0 },
        netSales: 0,
        grossSales: 0
      };

      transactions.forEach(transaction => {
        if (!transaction) return;
        
        const transactionDate = new Date(transaction.createdAt);
        const dateKey = transactionDate.toISOString().split('T')[0];
        const hour = transactionDate.getHours();
        const amount = parseFloat(transaction.amount) || 0;
        const tips = parseFloat(transaction.tips) || 0;
        
        data.dailySales[dateKey] = (data.dailySales[dateKey] || 0) + amount;
        
        const paymentMethod = transaction.paymentMethod?.toLowerCase() || 'unknown';
        data.paymentMethods[paymentMethod] = 
          (data.paymentMethods[paymentMethod] || 0) + amount;
        
        data.hourlySales[hour].sales += amount;
        data.tipsData.total += tips;
        data.tipsData.byMethod[paymentMethod] = 
          (data.tipsData.byMethod[paymentMethod] || 0) + tips;
        
        if (transaction.refundStatus && transaction.refundStatus !== 'none') {
          data.refunds += amount;
        }
        
        const taxRate = 0.08;
        const preTaxAmount = amount / (1 + taxRate);
        data.taxes.included += amount - preTaxAmount;
        data.taxes.excluded += preTaxAmount;
        data.grossSales += amount;
        data.netSales += preTaxAmount;
        
        if (Array.isArray(transaction.items)) {
          transaction.items.forEach(item => {
            if (!item?.name) return;
            
            const itemName = item.name;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemPrice = parseFloat(item.price) || 0;
            
            data.topItems[itemName] = {
              quantity: (data.topItems[itemName]?.quantity || 0) + itemQuantity,
              revenue: (data.topItems[itemName]?.revenue || 0) + (itemPrice * itemQuantity)
            };
          });
        }
      });

      setProcessedData(data);
    };

    // Process customer orders
    const processOrders = () => {
      const allOrders = customerData.customers.flatMap(customer => {
        return [...customer.orders.completed, ...customer.orders.pending, ...customer.orders.current]
          .map(order => ({ ...order, customerId: customer.id }))
          .filter(order => order.date); // Ensure orders have dates
      });
      
      // Get recent orders (last 5)
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      ).slice(0, 5);
      
      // Enrich with customer info
      const enrichedOrders = sortedOrders.map(order => {
        const customer = customerData.customers.find(c => c.id === order.customerId);
        return {
          ...order,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerAvatar: `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`,
          customerLocation: `${customer.homeAddress.city}, ${customer.homeAddress.country}`
        };
      });
      
      setRecentOrders(enrichedOrders);
      
      // Calculate stats
      const pendingOrders = allOrders.filter(o => o.status && !o.status.includes('Completed')).length;
      const completedToday = allOrders.filter(o => 
        new Date(o.date).toDateString() === new Date().toDateString() && 
        o.status && o.status.includes('Completed')
      ).length;
      
      setStats({
        pendingOrders,
        completedToday,
        totalCustomers: customerData.customers.length
      });
    };

    processData(sampleTransactions);
    processOrders();
    setLoading(false);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Data processing for charts
  const paymentMethodsData = Object.entries(processedData.paymentMethods || {})
    .map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));

  const topItemsByRevenue = Object.entries(processedData.topItems || {})
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data]) => ({ name, value: data.revenue }));

  const dailySalesData = Object.entries(processedData.dailySales || {})
    .map(([name, value]) => ({ 
      name: new Date(name).toLocaleDateString(), 
      sales: value 
    }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      
      <Grid container spacing={3}>
        {/* Stats Overview Row */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Badge badgeContent={stats.pendingOrders} color="error" max={99}>
              <ShoppingCart color="action" sx={{ fontSize: 40 }} />
            </Badge>
            <Typography variant="h6" sx={{ mt: 1 }}>Pending Orders</Typography>
            <Typography variant="body2" color="textSecondary">
              Needs attention
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Badge badgeContent={stats.completedToday} color="success">
              <Payment color="action" sx={{ fontSize: 40 }} />
            </Badge>
            <Typography variant="h6" sx={{ mt: 1 }}>Completed Today</Typography>
            <Typography variant="body2" color="textSecondary">
              Successful transactions
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ 
              bgcolor: '#4caf50', 
              width: 40, 
              height: 40,
              mx: 'auto'
            }}>
              {stats.totalCustomers}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 1 }}>Active Customers</Typography>
            <Typography variant="body2" color="textSecondary">
              Total registered
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <LocalShipping color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>Delivery Status</Typography>
            <Typography variant="body2" color="textSecondary">
              {recentOrders.filter(o => o.status === 'Shipped').length} in transit
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Orders</Typography>
              <Chip label="Live" color="error" size="small" />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ 
                            bgcolor: '#4caf50', 
                            width: 32, 
                            height: 32,
                            mr: 1
                          }}>
                            {order.customerAvatar}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {order.customerName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {order.customerLocation}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="500">
                          ${order.total || '0.00'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(order.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={order.status || 'Completed'} 
                          size="small"
                          icon={
                            order.status === 'Shipped' ? <ArrowUpward fontSize="small" /> : undefined
                          }
                          color={
                            order.status === 'Completed' ? 'success' :
                            order.status === 'Processing' ? 'warning' :
                            order.status === 'Shipped' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sales Summary */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2">Gross Sales</Typography>
                  <Typography variant="h4">
                    ${(processedData.grossSales || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2">Net Sales</Typography>
                  <Typography variant="h4">
                    ${(processedData.netSales || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2">Total Tips</Typography>
                  <Typography variant="h4">
                    ${(processedData.tipsData?.total || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2">Refunds</Typography>
                  <Typography variant="h4" color="error">
                    ${(processedData.refunds || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Main Analytics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Sales Trends" icon={<ArrowUpward fontSize="small" />} />
              <Tab label="Payment Methods" icon={<Payment fontSize="small" />} />
              <Tab label="Menu Items" icon={<ShoppingCart fontSize="small" />} />
              <Tab label="Hourly Data" icon={<LocalShipping fontSize="small" />} />
            </Tabs>
            
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Daily Sales</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Daily Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Top Menu Items by Revenue</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topItemsByRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#ffc658" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Hourly Sales Trends</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processedData.hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      name="Sales" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;