// Admin Model (Drizzle ORM) - Independent Admin System
import { pgTable, serial, varchar, timestamp, integer, unique, pgEnum } from 'drizzle-orm/pg-core';

// Admin system has superadmin and viewer roles
// superadmin can create viewers and inventory admins
export const adminRole = pgEnum("admin_role", ['superadmin', 'viewer']);

export const admins = pgTable('justoo_admins', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: adminRole().default('viewer').notNull(),
    isActive: integer('is_active').default(1).notNull(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
}, (table) => [
    unique("justoo_admins_username_unique").on(table.username),
    unique("justoo_admins_email_unique").on(table.email),
]);

export default admins;
