export default {
  customers: [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      email: "john.doe@example.com",
      dob: "1990-05-15",
      gender: "Male",
      username: "john_doe",
      accountCreationDate: "2023-01-10",
      loyaltyPoints: 1250,
      lastPurchaseDate: "2023-07-18",
      homeAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      orders: {
        completed: [
          { 
            orderId: "ORD-1001", 
            date: "2023-07-18T14:30:00Z", 
            total: 99.99, 
            tax: 8.00,
            subtotal: 91.99,
            tip: 15.00,
            paymentMethod: "credit",
            items: [
              { name: "Premium Burger", price: 12.99, quantity: 2, category: "Mains" },
              { name: "Truffle Fries", price: 8.99, quantity: 1, category: "Sides" },
              { name: "Craft Beer", price: 7.50, quantity: 2, category: "Drinks" }
            ],
            deliveryType: "pickup",
            receiptUrl: "/receipts/ord1001.pdf"
          },
          { 
            orderId: "ORD-1012", 
            date: "2023-07-15T19:45:00Z", 
            total: 45.50, 
            tax: 3.64,
            subtotal: 41.86,
            tip: 7.00,
            paymentMethod: "mobile",
            items: [
              { name: "Veggie Burger", price: 13.99, quantity: 1, category: "Mains" },
              { name: "Sweet Potato Fries", price: 4.99, quantity: 1, category: "Sides" }
            ],
            deliveryType: "delivery",
            receiptUrl: "/receipts/ord1012.pdf"
          }
        ],
        pending: [
          { 
            orderId: "ORD-1002", 
            date: "2023-07-20T12:15:00Z", 
            status: "Processing", 
            estimatedCompletion: "2023-07-20T13:30:00Z",
            items: [
              { name: "Chicken Sandwich", price: 11.99, quantity: 1, category: "Mains" }
            ],
            deliveryType: "pickup"
          }
        ],
        current: [
          { 
            orderId: "ORD-1003", 
            date: "2023-07-19T18:20:00Z", 
            status: "Shipped", 
            trackingNumber: "UPS-1Z999AA1012345678",
            carrier: "UPS",
            estimatedDelivery: "2023-07-21",
            comments: "Customer requested express delivery",
            items: [
              { name: "Gourmet Pizza", price: 18.99, quantity: 1, category: "Mains" },
              { name: "Garlic Bread", price: 5.99, quantity: 1, category: "Sides" }
            ],
            deliveryType: "shipping",
            receiptUrl: "/receipts/ord1003.pdf"
          }
        ]
      }
    },
    {
      id: 2,
      firstName: "Maria",
      lastName: "Garcia",
      phone: "+1987654321",
      email: "maria.garcia@example.com",
      dob: "1985-08-22",
      gender: "Female",
      username: "maria_g",
      accountCreationDate: "2022-11-15",
      loyaltyPoints: 850,
      lastPurchaseDate: "2023-07-17",
      homeAddress: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zip: "90012",
        country: "USA",
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      orders: {
        completed: [
          { 
            orderId: "ORD-2001", 
            date: "2023-07-17T13:45:00Z", 
            total: 75.25, 
            tax: 6.02,
            subtotal: 69.23,
            tip: 10.00,
            paymentMethod: "debit",
            items: [
              { name: "Caesar Salad", price: 8.99, quantity: 1, category: "Salads" },
              { name: "Grilled Salmon", price: 22.99, quantity: 1, category: "Mains" },
              { name: "Sparkling Water", price: 2.50, quantity: 1, category: "Drinks" }
            ],
            deliveryType: "dine-in",
            receiptUrl: "/receipts/ord2001.pdf"
          }
        ],
        pending: [],
        current: [
          { 
            orderId: "ORD-2002", 
            date: "2023-07-19T20:00:00Z", 
            status: "Preparing", 
            estimatedCompletion: "2023-07-19T20:45:00Z",
            comments: "Allergies: gluten-free required",
            items: [
              { name: "Gluten-Free Pasta", price: 16.99, quantity: 1, category: "Mains" },
              { name: "House Salad (GF)", price: 7.99, quantity: 1, category: "Salads" }
            ],
            deliveryType: "dine-in",
            receiptUrl: "/receipts/ord2002.pdf"
          }
        ]
      }
    },
    // Additional customers with similar enhanced structure...
    {
      id: 3,
      firstName: "James",
      lastName: "Smith",
      phone: "+1555123456",
      email: "james.smith@example.com",
      dob: "1978-03-30",
      gender: "Male",
      username: "james_s",
      accountCreationDate: "2023-02-28",
      loyaltyPoints: 420,
      lastPurchaseDate: "2023-07-16",
      homeAddress: {
        street: "789 Pine Rd",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        country: "USA",
        coordinates: { lat: 41.8781, lng: -87.6298 }
      },
      orders: {
        completed: [
          { 
            orderId: "ORD-3001", 
            date: "2023-07-16T12:30:00Z", 
            total: 120.75, 
            tax: 9.66,
            subtotal: 111.09,
            tip: 18.00,
            paymentMethod: "credit",
            items: [
              { name: "Ribeye Steak", price: 34.99, quantity: 2, category: "Mains" },
              { name: "Mashed Potatoes", price: 5.99, quantity: 2, category: "Sides" },
              { name: "Red Wine", price: 12.50, quantity: 2, category: "Drinks" }
            ],
            deliveryType: "dine-in",
            receiptUrl: "/receipts/ord3001.pdf"
          },
          { 
            orderId: "ORD-3002", 
            date: "2023-07-10T19:15:00Z", 
            total: 89.99, 
            tax: 7.20,
            subtotal: 82.79,
            tip: 12.00,
            paymentMethod: "mobile",
            items: [
              { name: "Lobster Roll", price: 24.99, quantity: 2, category: "Mains" },
              { name: "Coleslaw", price: 3.99, quantity: 1, category: "Sides" }
            ],
            deliveryType: "pickup",
            receiptUrl: "/receipts/ord3002.pdf"
          }
        ],
        pending: [
          { 
            orderId: "ORD-3003", 
            date: "2023-07-20T11:30:00Z", 
            status: "Payment Pending", 
            items: [
              { name: "Breakfast Burrito", price: 9.99, quantity: 1, category: "Mains" },
              { name: "Orange Juice", price: 3.50, quantity: 1, category: "Drinks" }
            ],
            deliveryType: "delivery"
          }
        ],
        current: []
      }
    }
  ]
};