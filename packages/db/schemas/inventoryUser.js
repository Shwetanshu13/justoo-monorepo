// Inventory Admin Model - For admin system to manage inventory users
import { pgTable, serial, varchar, timestamp, integer, unique, pgEnum } from 'drizzle-orm/pg-core';

// Inventory user roles
export const inventoryUserRole = pgEnum('inventory_user_role', ['admin', 'viewer']);

// Reference to the inventory_users table in inventory system
export const inventoryUsers = pgTable('inventory_users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: inventoryUserRole().default('viewer').notNull(),
    isActive: integer('is_active').default(1).notNull(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdBy: integer('created_by'), // Reference to admin who created this
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (table) => [
    unique("inventory_users_username_unique").on(table.username),
    unique("inventory_users_email_unique").on(table.email),
]);

export default inventoryUsers;
