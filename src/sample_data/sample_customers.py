import random
import json
import faker
from datetime import datetime, timedelta
import decimal


fake = faker.Faker()

# Configuration
NUM_CUSTOMERS = 1000
MAX_COMPLETED_ORDERS = 10
MAX_PENDING_ORDERS = 3
MAX_CURRENT_ORDERS = 3

PAYMENT_METHODS = ["credit", "debit", "mobile", "cash", "giftcard"]
DELIVERY_TYPES = ["pickup", "delivery", "shipping", "dine-in"]

# Generate random items for orders
MENU_ITEMS = [
    ("Premium Burger", "Mains", 12.99),
    ("Veggie Burger", "Mains", 13.99),
    ("Truffle Fries", "Sides", 8.99),
    ("Sweet Potato Fries", "Sides", 4.99),
    ("Craft Beer", "Drinks", 7.50),
    ("Gourmet Pizza", "Mains", 18.99),
    ("Garlic Bread", "Sides", 5.99),
    ("Caesar Salad", "Salads", 8.99),
    ("Grilled Salmon", "Mains", 22.99),
    ("Sparkling Water", "Drinks", 2.50),
    ("Lobster Roll", "Mains", 24.99),
    ("Coleslaw", "Sides", 3.99),
    ("Breakfast Burrito", "Mains", 9.99),
    ("Orange Juice", "Drinks", 3.50),
    ("Gluten-Free Pasta", "Mains", 16.99),
    ("House Salad (GF)", "Salads", 7.99),
    ("Taco Set", "Mains", 9.80),
    ("Bagel Combo", "Breakfast", 6.10)
]

def random_items():
    items = []
    for _ in range(random.randint(1, 4)):
        name, cat, price = random.choice(MENU_ITEMS)
        qty = random.randint(1, 3)
        items.append({"name": name, "price": price, "quantity": qty, "category": cat})
    return items

def make_order(order_id, status):
    date = fake.date_time_between(start_date="-1y", end_date="now")
    items = random_items()
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    tax = round(subtotal * 0.08, 2)
    tip = round(subtotal * 0.1, 2) if status == "completed" else 0
    total = round(subtotal + tax + tip, 2)
    payment_method = random.choice(PAYMENT_METHODS)
    delivery_type = random.choice(DELIVERY_TYPES)
    order = {
        "orderId": f"ORD-{order_id}",
        "date": date.isoformat(),
        "total": total,
        "tax": tax,
        "subtotal": subtotal,
        "tip": tip,
        "paymentMethod": payment_method,
        "items": items,
        "deliveryType": delivery_type,
        "receiptUrl": f"/receipts/ord{order_id}.pdf" if status != "pending" else None
    }
    if status != "completed":
        order["status"] = fake.word().capitalize()
    return order

customers = []
order_counter = 1000

for cid in range(1, NUM_CUSTOMERS + 1):
    first_name = fake.first_name()
    last_name = fake.last_name()
    username = f"{first_name.lower()}_{last_name.lower()}"
    account_date = fake.date_between(start_date="-2y", end_date="now")
    dob = fake.date_of_birth(minimum_age=18, maximum_age=80)
    loyalty_points = random.randint(0, 2000)
    last_purchase = fake.date_between(start_date=account_date, end_date="now")

    # Orders
    completed_orders = [make_order(order_counter + i, "completed")
                         for i in range(random.randint(0, MAX_COMPLETED_ORDERS))]
    order_counter += len(completed_orders)

    pending_orders = [make_order(order_counter + i, "pending")
                       for i in range(random.randint(0, MAX_PENDING_ORDERS))]
    order_counter += len(pending_orders)

    current_orders = [make_order(order_counter + i, "current")
                       for i in range(random.randint(0, MAX_CURRENT_ORDERS))]
    order_counter += len(current_orders)

    customers.append({
        "id": cid,
        "firstName": first_name,
        "lastName": last_name,
        "phone": fake.phone_number(),
        "email": fake.email(),
        "dob": dob.isoformat(),
        "gender": random.choice(["Male", "Female"]),
        "username": username,
        "accountCreationDate": account_date.isoformat(),
        "loyaltyPoints": loyalty_points,
        "lastPurchaseDate": last_purchase.isoformat(),
        "homeAddress": {
            "street": fake.street_address(),
            "city": fake.city(),
            "state": fake.state_abbr(),
            "zip": fake.postcode(),
            "country": "USA",
            "coordinates": {"lat": fake.latitude(), "lng": fake.longitude()}
        },
        "orders": {
            "completed": completed_orders,
            "pending": pending_orders,
            "current": current_orders
        }
    })
# At the end, when dumping:
def decimal_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

js_content = "export default {\n  customers: " + json.dumps(customers, indent=2, default=decimal_default) + "\n};\n"

with open("sample_customers.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("✅ sample_customers.js generated with", NUM_CUSTOMERS, "customers")
