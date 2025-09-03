// Payment Model - For order payment tracking
import { pgTable, serial, integer, varchar, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';

export const paymentMethod = pgEnum("payment_method", ['cash', 'upi', 'card', 'wallet']);
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed', 'refunded']);

export const payments = pgTable('justoo_payments', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    method: paymentMethod().notNull(),
    status: paymentStatus().default('pending').notNull(),
    transactionId: varchar('transaction_id', { length: 255 }),
    gatewayResponse: varchar('gateway_response', { length: 500 }),
    paidAt: timestamp('paid_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
});

export default payments;