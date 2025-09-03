// Shared Order Items Model - Used by both inventory and admin systems
import { pgTable, integer, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';

// This references the same table as inventory system - keep same name
export const orderItems = pgTable('order_items', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer('order_id').notNull(),
    itemId: integer('item_id').notNull(),
    itemName: varchar('item_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
});

export default orderItems;
