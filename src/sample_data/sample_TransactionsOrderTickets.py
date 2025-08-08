import random
import json
from datetime import datetime, timedelta

# --- Sample data pools ---
names = [
    "Alice Chen", "Brian Wang", "Cathy Lee", "David Lin", "Emily Wu",
    "Frank Huang", "Grace Chang", "Henry Liu", "Ivy Hsu", "Jack Tsai"
]
emails = [
    "alice@example.com", "brian@example.com", "cathy@example.com",
    "david@example.com", "emily@example.com", "frank@example.com",
    "grace@example.com", "henry@example.com", "ivy@example.com", "jack@example.com"
]
channels = ["online", "in-store", "phone", "app"]
payment_methods = ["credit", "cash", "debit", "mobile"]
statuses = ["paid", "pending", "refunded", "cancelled"]
products = [
    ("Classic Burger", 12.99, "Mains"),
    ("Cheeseburger", 14.99, "Mains"),
    ("Bacon Burger", 16.99, "Mains"),
    ("Veggie Burger", 13.99, "Mains"),
    ("Chicken Sandwich", 11.99, "Mains"),
    ("French Fries", 3.99, "Sides"),
    ("Onion Rings", 4.99, "Sides"),
    ("Caesar Salad", 8.99, "Salads"),
    ("Greek Salad", 9.99, "Salads"),
    ("Soda", 2.50, "Drinks"),
    ("Iced Tea", 2.75, "Drinks"),
    ("Beer", 5.99, "Drinks"),
    ("Wine", 7.50, "Drinks"),
    ("Chocolate Cake", 6.99, "Desserts"),
    ("Cheesecake", 7.99, "Desserts")
]

def random_items():
    count = random.randint(1, 4)
    items = []
    subtotal = 0
    for _ in range(count):
        name, price, category = random.choice(products)
        qty = random.randint(1, 3)
        items.append({
            "name": name,
            "price": price,
            "qty": qty,
            "category": category
        })
        subtotal += price * qty
    return items, round(subtotal, 2)

def random_meta(currency):
    return {
        "paymentId": f"PAY-{random.randint(1000, 9999)}",
        "provider": random.choice(["Visa", "Mastercard", "Apple Pay", "Google Pay", "CashDesk"]),
        "transactionRef": f"REF-{random.randint(100000, 999999)}",
        "ip": f"192.168.{random.randint(0, 255)}.{random.randint(0, 255)}",
        "userAgent": "Mozilla/5.0",
        "device": random.choice(["Desktop", "Mobile", "Tablet"]),
        "appVersion": f"v{random.randint(1, 4)}.{random.randint(0, 9)}",
        "language": random.choice(["en-US", "zh-TW", "ja-JP"]),
        "geo": random.choice(["Taipei, Taiwan", "Kaohsiung, Taiwan", "Taichung, Taiwan"]),
        "couponCode": random.choice(["", "SAVE10", "FREESHIP", "WELCOME"]),
        "shippingMethod": random.choice(["Pickup", "Delivery"]),
        "shippingCost": round(random.uniform(0, 5), 2),
        "serviceFee": round(random.uniform(0, 2), 2),
        "riskScore": random.randint(1, 10),
        "reviewRequired": random.choice([True, False]),
        "paidAt": None,
        "fulfilledAt": None,
        "refundedAt": None,
        "fulfillmentStatus": random.choice(["Shipped", "Completed", "Pending"]),
        "storeLocation": random.choice(["Main Branch", "Online Warehouse", "Call Center"]),
        "cashier": random.choice(["", "Staff A", "Staff B", "Staff C"]),
        "registerId": f"REG-{random.randint(1, 10)}",
        "taxRegion": "Taiwan",
        "taxRate": 0.05,
        "taxId": f"TXID-{random.randint(10000, 99999)}",
        "customerTaxId": f"CTID-{random.randint(10000, 99999)}",
        "tags": random.sample(["food", "dessert", "ecommerce", "promo"], k=random.randint(0, 3)),
        "attachments": [],
        "notesInternal": ""
    }

def generate_transactions(n=1000):
    orders = []
    now = datetime.now()
    for i in range(n):
        created_at = now - timedelta(days=random.randint(0, 180), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        customer_idx = random.randint(0, len(names)-1)
        items, subtotal = random_items()
        tax = round(subtotal * 0.05, 2)
        fees = round(random.uniform(0, 2), 2)
        discount = round(random.uniform(0, 5), 2)
        total = round(subtotal + tax + fees - discount, 2)
        currency = "USD"
        
        order = {
            "id": f"TX-{1000+i}",
            "createdAt": created_at.isoformat(),
            "customer": {"name": names[customer_idx], "email": emails[customer_idx]},
            "channel": random.choice(channels),
            "paymentMethod": random.choice(payment_methods),
            "status": random.choice(statuses),
            "items": items,
            "subtotal": subtotal,
            "tax": tax,
            "fees": fees,
            "discount": discount,
            "total": total,
            "currency": currency,
            "meta": random_meta(currency)
        }
        orders.append(order)
    return orders

# --- Generate and save as JS ---
n = 100
transactions = generate_transactions(n)
with open("pythonOutputTransactionsOrderTickets.js", "w", encoding="utf-8") as f:
    f.write("export const sample_Transactions = ")
    json.dump(transactions, f, indent=2)
    f.write(";\n")

print(f"✅ sample_TransactionsOrderTickets.js generated with {n} orders")
