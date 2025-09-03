// Rider Model - Separate table for delivery personnel
import { pgTable, serial, varchar, timestamp, integer, unique, pgEnum, text } from 'drizzle-orm/pg-core';

export const riderStatus = pgEnum("rider_status", ['active', 'inactive', 'busy', 'suspended']);

export const riders = pgTable('justoo_riders', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }).notNull(),
    vehicleType: varchar('vehicle_type', { length: 50 }).notNull(),
    vehicleNumber: varchar('vehicle_number', { length: 50 }).notNull(),
    licenseNumber: varchar('license_number', { length: 100 }),
    status: riderStatus().default('active').notNull(),
    totalDeliveries: integer('total_deliveries').default(0).notNull(),
    rating: integer('rating').default(5), // Rating out of 5
    isActive: integer('is_active').default(1).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (table) => [
    unique("justoo_riders_phone_unique").on(table.phone),
    unique("justoo_riders_vehicle_number_unique").on(table.vehicleNumber),
]);

export default riders;
