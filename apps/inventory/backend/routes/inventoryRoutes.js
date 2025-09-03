import express from 'express';
import {
    addItem,
    editItem,
    deleteItem,
    listInStockItems,
    listOutOfStockItems,
    listLowStockItems,
    getAllItems,
    getItemById,
    VALID_UNITS
} from '../controllers/inventoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/units', (req, res) => {               // GET /api/inventory/units
    res.json({
        success: true,
        data: VALID_UNITS
    });
});

// Protected routes (require authentication)
// Read operations - all authenticated users can access
router.get('/items', authenticateToken, getAllItems);                 // GET /api/inventory/items
router.get('/items/:id', authenticateToken, getItemById);             // GET /api/inventory/items/:id
router.get('/stock/in-stock', authenticateToken, listInStockItems);     // GET /api/inventory/stock/in-stock
router.get('/stock/out-of-stock', authenticateToken, listOutOfStockItems); // GET /api/inventory/stock/out-of-stock
router.get('/stock/low-stock', authenticateToken, listLowStockItems);   // GET /api/inventory/stock/low-stock

// Write operations - require admin role only
router.post('/items', authenticateToken, authorizeRoles('admin'), addItem);                    // POST /api/inventory/items
router.put('/items/:id', authenticateToken, authorizeRoles('admin'), editItem);                // PUT /api/inventory/items/:id
router.delete('/items/:id', authenticateToken, authorizeRoles('admin'), deleteItem);           // DELETE /api/inventory/items/:id

// Get dashboard statistics - require authentication
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        // This could be moved to a separate controller if needed
        const { db } = await import('../db/index.js');
        const { itemTable } = await import('../db/schema.js');
        const { eq, sql, and } = await import('drizzle-orm');

        const [
            totalItems,
            inStockItems,
            outOfStockItems,
            lowStockItems,
            totalValue
        ] = await Promise.all([
            // Total active items
            db.select({ count: sql`count(*)` }).from(itemTable)
                .where(eq(itemTable.isActive, 1)),

            // In stock items
            db.select({ count: sql`count(*)` }).from(itemTable)
                .where(and(
                    eq(itemTable.isActive, 1),
                    sql`${itemTable.quantity} > 0`
                )),

            // Out of stock items
            db.select({ count: sql`count(*)` }).from(itemTable)
                .where(and(
                    eq(itemTable.isActive, 1),
                    eq(itemTable.quantity, 0)
                )),

            // Low stock items
            db.select({ count: sql`count(*)` }).from(itemTable)
                .where(and(
                    eq(itemTable.isActive, 1),
                    sql`${itemTable.quantity} <= ${itemTable.minStockLevel}`,
                    sql`${itemTable.quantity} > 0`
                )),

            // Total inventory value
            db.select({
                value: sql`SUM(CAST(${itemTable.price} AS DECIMAL) * ${itemTable.quantity})`
            }).from(itemTable)
                .where(eq(itemTable.isActive, 1))
        ]);

        res.json({
            success: true,
            data: {
                totalItems: parseInt(totalItems[0].count),
                inStockItems: parseInt(inStockItems[0].count),
                outOfStockItems: parseInt(outOfStockItems[0].count),
                lowStockItems: parseInt(lowStockItems[0].count),
                totalInventoryValue: parseFloat(totalValue[0].value || 0).toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;
