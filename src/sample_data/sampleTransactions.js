// src/data/sampleTransactions.js
const generateSampleTransactions = () => {
  const menuItems = [
    { name: "Classic Burger", price: 12.99, category: "Mains" },
    { name: "Cheeseburger", price: 14.99, category: "Mains" },
    { name: "Bacon Burger", price: 16.99, category: "Mains" },
    { name: "Veggie Burger", price: 13.99, category: "Mains" },
    { name: "Chicken Sandwich", price: 11.99, category: "Mains" },
    { name: "French Fries", price: 3.99, category: "Sides" },
    { name: "Onion Rings", price: 4.99, category: "Sides" },
    { name: "Caesar Salad", price: 8.99, category: "Salads" },
    { name: "Greek Salad", price: 9.99, category: "Salads" },
    { name: "Soda", price: 2.50, category: "Drinks" },
    { name: "Iced Tea", price: 2.75, category: "Drinks" },
    { name: "Beer", price: 5.99, category: "Drinks" },
    { name: "Wine", price: 7.50, category: "Drinks" },
    { name: "Chocolate Cake", price: 6.99, category: "Desserts" },
    { name: "Cheesecake", price: 7.99, category: "Desserts" }
  ];

  const paymentMethods = ["credit", "cash", "debit", "mobile"];
  const transactions = [];
  
  // Generate 30 days of data
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - day)); // Last 30 days
    
    // Generate 5-15 transactions per day
    const transactionsPerDay = 5 + Math.floor(Math.random() * 11);
    
    for (let i = 0; i < transactionsPerDay; i++) {
      // Random time between 11am and 10pm (restaurant hours)
      const hours = 11 + Math.floor(Math.random() * 11);
      const minutes = Math.floor(Math.random() * 60);
      const transactionDate = new Date(date);
      transactionDate.setHours(hours, minutes, 0);
      
      // Generate 1-5 random items
      const itemCount = 1 + Math.floor(Math.random() * 5);
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 of each item
        items.push({
          name: menuItem.name,
          price: menuItem.price.toFixed(2),
          quantity: quantity.toString(),
          category: menuItem.category
        });
        subtotal += menuItem.price * quantity;
      }
      
      // Calculate total with 8% tax
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      
      // Generate tip (10-20% of subtotal)
      const tipPercent = 0.10 + (Math.random() * 0.10);
      const tip = subtotal * tipPercent;
      
      transactions.push({
        id: `T${day}${i}${Date.now()}`,
        amount: total.toFixed(2),
        tips: tip.toFixed(2),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        refundStatus: Math.random() > 0.95 ? "refunded" : "none", // 5% chance of refund
        createdAt: transactionDate.toISOString(),
        items
      });
    }
  }
  
  return transactions;
};

const sampleTransactions = generateSampleTransactions();
export default sampleTransactions;