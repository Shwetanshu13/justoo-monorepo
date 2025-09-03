import { pgTable, serial, varchar, timestamp, integer, unique } from 'drizzle-orm/pg-core'

export const customers = pgTable('customers', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }).notNull(),
    address: varchar('address', { length: 500 }),
    isActive: integer('is_active').default(1).notNull(),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow()
}, (table) => [
    unique('customers_phone_unique').on(table.phone)
])

export default customers
