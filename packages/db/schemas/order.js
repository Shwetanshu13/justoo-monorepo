// Shared Order Model - Used by both inventory and admin systems
import { pgTable, integer, varchar, decimal, timestamp, text, pgEnum } from 'drizzle-orm/pg-core';

// Order status enum for better type safety
export const orderStatus = pgEnum("order_status", [
    'placed', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled'
]);

// This references the same table as inventory system - keep same name
export const orders = pgTable('orders', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    customerId: integer('customer_id').notNull(),
    status: orderStatus().default('placed').notNull(),
    totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
    itemCount: integer().notNull(),
    deliveryAddress: text('delivery_address'),
    riderId: integer('rider_id'),
    estimatedDeliveryTime: timestamp('estimated_delivery_time', { mode: 'string' }),
    deliveredAt: timestamp('delivered_at', { mode: 'string' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
});

export default orders;
