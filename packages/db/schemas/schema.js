import { integer, pgTable, varchar, timestamp, pgEnum, decimal, text } from "drizzle-orm/pg-core";

// Define unit enum with fixed values
export const unitEnum = pgEnum('unit', ['kg', 'grams', 'ml', 'litre', 'pieces', 'dozen', 'packet', 'bottle', 'can']);

// Define role enum with only two roles
export const roleEnum = pgEnum('role', ['admin', 'viewer']);

// Users table for authentication - renamed to avoid conflict with admin system
export const usersTable = pgTable("inventory_users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 100 }).notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(), // Will store hashed password
    role: roleEnum().notNull().default('viewer'),
    isActive: integer().notNull().default(1), // 1 for active, 0 for inactive
    lastLogin: timestamp(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
});

export const itemTable = pgTable("items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: decimal({ precision: 10, scale: 2 }).notNull(), // Better for currency
    quantity: integer().notNull().default(0),
    minStockLevel: integer().notNull().default(10), // For low stock alerts
    discount: decimal({ precision: 5, scale: 2 }).default('0.00'), // Percentage discount
    unit: unitEnum().notNull(),
    category: varchar({ length: 100 }),
    isActive: integer().notNull().default(1), // 1 for active, 0 for inactive
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
});

// Define order status enum to match admin system
export const orderStatusEnum = pgEnum('order_status', [
    'placed', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled'
]);

// Orders table to track order history - aligned with admin system
export const ordersTable = pgTable("orders", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull(), // Foreign key to users table
    status: orderStatusEnum().notNull().default('placed'),
    totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
    itemCount: integer().notNull(),
    customerName: varchar({ length: 255 }),
    customerPhone: varchar({ length: 20 }),
    customerEmail: varchar({ length: 255 }),
    deliveryAddress: text(),
    riderId: integer(), // Link to rider for delivery tracking (admin system feature)
    estimatedDeliveryTime: timestamp(),
    deliveredAt: timestamp(),
    notes: text(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow(),
});

// Order items table to track individual items in each order - aligned with admin system
export const orderItemsTable = pgTable("order_items", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer().notNull(), // Foreign key to orders table
    itemId: integer().notNull(), // Foreign key to items table
    itemName: varchar({ length: 255 }).notNull(), // Store item name at time of order
    quantity: integer().notNull(),
    unitPrice: decimal({ precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal({ precision: 10, scale: 2 }).notNull(),
    unit: varchar({ length: 50 }).notNull(),
    createdAt: timestamp().defaultNow(),
});

