import { pgTable, serial, varchar, integer, decimal, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'

export const unit = pgEnum('unit', ['kg', 'grams', 'ml', 'litre', 'pieces', 'dozen', 'packet', 'bottle', 'can'])

export const items = pgTable('items', {
    id: serial('id').primaryKey(),
    sku: varchar('sku', { length: 64 }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').notNull().default(0),
    minStockLevel: integer('min_stock_level').notNull().default(10),
    unit: unit().notNull(),
    category: varchar('category', { length: 100 }),
    isActive: integer('is_active').notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow()
})

export default items
