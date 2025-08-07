export default {
  customers: [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      dob: "1990-05-15",
      gender: "Male",
      username: "john_doe",
      accountCreationDate: "2023-01-10",
      homeAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA"
      },
      orders: {
        completed: [
          { orderId: "ORD-1001", date: "2023-02-01", total: 99.99, receiptUrl: "/receipts/ord1001.pdf" },
          { orderId: "ORD-1012", date: "2023-06-18", total: 45.50, receiptUrl: "/receipts/ord1012.pdf" }
        ],
        pending: [
          { orderId: "ORD-1002", date: "2023-03-10", status: "Processing" }
        ],
        current: [
          { 
            orderId: "ORD-1003", 
            date: "2023-04-05", 
            status: "Shipped", 
            comments: "Customer requested express delivery",
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
      dob: "1985-08-22",
      gender: "Female",
      username: "maria_g",
      accountCreationDate: "2022-11-15",
      homeAddress: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zip: "90012",
        country: "USA"
      },
      orders: {
        completed: [
          { orderId: "ORD-2001", date: "2023-01-05", total: 75.25, receiptUrl: "/receipts/ord2001.pdf" }
        ],
        pending: [],
        current: [
          { 
            orderId: "ORD-2002", 
            date: "2023-05-20", 
            status: "Preparing", 
            comments: "Allergies: gluten-free required",
            receiptUrl: "/receipts/ord2002.pdf"
          }
        ]
      }
    },
    {
      id: 3,
      firstName: "James",
      lastName: "Smith",
      phone: "+1555123456",
      dob: "1978-03-30",
      gender: "Male",
      username: "james_s",
      accountCreationDate: "2023-02-28",
      homeAddress: {
        street: "789 Pine Rd",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        country: "USA"
      },
      orders: {
        completed: [
          { orderId: "ORD-3001", date: "2023-03-15", total: 120.75, receiptUrl: "/receipts/ord3001.pdf" },
          { orderId: "ORD-3002", date: "2023-04-22", total: 89.99, receiptUrl: "/receipts/ord3002.pdf" }
        ],
        pending: [
          { orderId: "ORD-3003", date: "2023-07-01", status: "Payment Pending" }
        ],
        current: []
      }
    },
    {
      id: 4,
      firstName: "Li",
      lastName: "Wei",
      phone: "+8613812345678",
      dob: "1995-11-08",
      gender: "Female",
      username: "li_wei",
      accountCreationDate: "2023-04-12",
      homeAddress: {
        street: "101 Beijing Rd",
        city: "Shanghai",
        state: "SH",
        zip: "200000",
        country: "China"
      },
      orders: {
        completed: [],
        pending: [],
        current: [
          { 
            orderId: "ORD-4001", 
            date: "2023-07-05", 
            status: "International Shipping", 
            comments: "Gift wrapping requested",
            receiptUrl: "/receipts/ord4001.pdf"
          }
        ]
      }
    },
    {
      id: 5,
      firstName: "Olivia",
      lastName: "Brown",
      phone: "+447700123456",
      dob: "1992-07-19",
      gender: "Female",
      username: "olivia_b",
      accountCreationDate: "2022-09-05",
      homeAddress: {
        street: "202 Baker St",
        city: "London",
        state: "",
        zip: "NW1 6XE",
        country: "UK"
      },
      orders: {
        completed: [
          { orderId: "ORD-5001", date: "2023-01-18", total: 65.99, receiptUrl: "/receipts/ord5001.pdf" },
          { orderId: "ORD-5002", date: "2023-03-29", total: 112.40, receiptUrl: "/receipts/ord5002.pdf" },
          { orderId: "ORD-5003", date: "2023-06-11", total: 34.50, receiptUrl: "/receipts/ord5003.pdf" }
        ],
        pending: [],
        current: []
      }
    },
    // Additional customers (6-10) with similar structure...
    {
      id: 6,
      firstName: "Mohammed",
      lastName: "Al-Farsi",
      phone: "+966501234567",
      dob: "1988-12-03",
      gender: "Male",
      username: "mohammed_a",
      accountCreationDate: "2023-05-22",
      homeAddress: {
        street: "King Fahd Rd",
        city: "Riyadh",
        state: "",
        zip: "11564",
        country: "Saudi Arabia"
      },
      orders: {
        completed: [
          { orderId: "ORD-6001", date: "2023-06-30", total: 210.00, receiptUrl: "/receipts/ord6001.pdf" }
        ],
        pending: [
          { orderId: "ORD-6002", date: "2023-07-12", status: "Awaiting Stock" }
        ],
        current: []
      }
    },
    {
      id: 7,
      firstName: "Sophie",
      lastName: "Martin",
      phone: "+33123456789",
      dob: "1993-04-25",
      gender: "Female",
      username: "sophie_m",
      accountCreationDate: "2022-12-08",
      homeAddress: {
        street: "88 Rue de Rivoli",
        city: "Paris",
        state: "",
        zip: "75004",
        country: "France"
      },
      orders: {
        completed: [
          { orderId: "ORD-7001", date: "2023-02-14", total: 78.30, receiptUrl: "/receipts/ord7001.pdf" }
        ],
        pending: [],
        current: [
          { 
            orderId: "ORD-7002", 
            date: "2023-07-08", 
            status: "Delivered", 
            comments: "Left at front desk",
            receiptUrl: "/receipts/ord7002.pdf"
          }
        ]
      }
    },
    {
      id: 8,
      firstName: "David",
      lastName: "Kim",
      phone: "+82212345678",
      dob: "1987-09-14",
      gender: "Male",
      username: "david_k",
      accountCreationDate: "2023-03-17",
      homeAddress: {
        street: "Gangnam-daero 123",
        city: "Seoul",
        state: "",
        zip: "06241",
        country: "South Korea"
      },
      orders: {
        completed: [],
        pending: [
          { orderId: "ORD-8001", date: "2023-07-15", status: "Processing" }
        ],
        current: []
      }
    },
    {
      id: 9,
      firstName: "Emma",
      lastName: "Wilson",
      phone: "+61398765432",
      dob: "1991-02-28",
      gender: "Female",
      username: "emma_w",
      accountCreationDate: "2023-01-30",
      homeAddress: {
        street: "42 George St",
        city: "Sydney",
        state: "NSW",
        zip: "2000",
        country: "Australia"
      },
      orders: {
        completed: [
          { orderId: "ORD-9001", date: "2023-04-03", total: 55.75, receiptUrl: "/receipts/ord9001.pdf" },
          { orderId: "ORD-9002", date: "2023-05-19", total: 92.10, receiptUrl: "/receipts/ord9002.pdf" }
        ],
        pending: [],
        current: []
      }
    },
    {
      id: 10,
      firstName: "Carlos",
      lastName: "Silva",
      phone: "+5511987654321",
      dob: "1983-10-11",
      gender: "Male",
      username: "carlos_s",
      accountCreationDate: "2022-10-22",
      homeAddress: {
        street: "Avenida Paulista 1000",
        city: "São Paulo",
        state: "SP",
        zip: "01310-100",
        country: "Brazil"
      },
      orders: {
        completed: [
          { orderId: "ORD-10001", date: "2023-03-08", total: 134.20, receiptUrl: "/receipts/ord10001.pdf" }
        ],
        pending: [],
        current: [
          { 
            orderId: "ORD-10002", 
            date: "2023-07-10", 
            status: "In Transit", 
            comments: "Fragile items - handle with care",
            receiptUrl: "/receipts/ord10002.pdf"
          }
        ]
      }
    }
  ]
};