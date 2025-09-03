# Database package

Unified schema for 10-minute delivery app with a single inventory owned by the client.

Core tables:

- admins (superadmin, viewer)
- inventory_users (admin, viewer)
- riders
- customers
- items
- orders, order_items
- justoo_payments

Notes:

- Single-inventory design: no multi-tenant/org tables.
- Orders reference customers and optional rider.
- Inventory users manage items and orders; admins manage inventory users and riders.
