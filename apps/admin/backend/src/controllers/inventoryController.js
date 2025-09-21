import db from '../config/dbConfig.js';
import { items, orders, orderItems } from '@justoo/db';
import { eq, and, count, sum, avg, desc, asc, sql, gt, lt, isNull } from 'drizzle-orm';
import { errorResponse, successResponse } from '../utils/response.js';

// Get all items with pagination and filtering
export const getAllItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            isActive,
            sortBy = 'name',
            sortOrder = 'asc',
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let query = db.select().from(items);

        // Apply filters
        const conditions = [];

        if (category) {
            conditions.push(eq(items.category, category));
        }

        if (isActive !== undefined) {
            conditions.push(eq(items.isActive, parseInt(isActive)));
        }

        if (search) {
            conditions.push(sql`${items.name} ILIKE ${'%' + search + '%'}`);
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply sorting
        const sortColumn = items[sortBy] || items.name;
        query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

        // Apply pagination
        const itemsList = await query.limit(parseInt(limit)).offset(offset);

        // Get total count for pagination
        let countQuery = db.select({ count: count() }).from(items);
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
        }
        const totalItems = await countQuery;

        return successResponse(res, 'Items retrieved successfully', {
            items: itemsList,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems[0].count / limit),
                totalItems: totalItems[0].count,
                hasNext: page * limit < totalItems[0].count,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting items:', error);
        return errorResponse(res, 'Failed to retrieve items', 500);
    }
};

// Get comprehensive inventory analytics
export const getInventoryAnalytics = async (req, res) => {
    try {
        // 1. Stock Level Analytics
        const stockAnalytics = await getStockLevelAnalytics();

        // 2. Financial Analytics
        const financialAnalytics = await getFinancialAnalytics();

        // 3. Performance Analytics
        const performanceAnalytics = await getPerformanceAnalytics();

        // 4. Category Analytics
        const categoryAnalytics = await getCategoryAnalytics();

        const analytics = {
            stockLevels: stockAnalytics,
            financial: financialAnalytics,
            performance: performanceAnalytics,
            categories: categoryAnalytics,
            timestamp: new Date().toISOString()
        };

        return successResponse(res, 'Inventory analytics retrieved successfully', analytics);
    } catch (error) {
        console.error('Error getting inventory analytics:', error);
        return errorResponse(res, 'Failed to retrieve inventory analytics', 500);
    }
};

// Stock Level Analytics Helper
const getStockLevelAnalytics = async () => {
    // Low stock items (quantity <= minStockLevel)
    const lowStockItems = await db
        .select()
        .from(items)
        .where(and(
            sql`${items.quantity} <= ${items.minStockLevel}`,
            eq(items.isActive, 1)
        ));

    // Out of stock items
    const outOfStockItems = await db
        .select()
        .from(items)
        .where(and(
            eq(items.quantity, 0),
            eq(items.isActive, 1)
        ));

    // Overstock items (quantity > minStockLevel * 5)
    const overstockItems = await db
        .select()
        .from(items)
        .where(and(
            sql`${items.quantity} > ${items.minStockLevel} * 5`,
            eq(items.isActive, 1)
        ));

    // Total active items
    const totalActiveItems = await db
        .select({ count: count() })
        .from(items)
        .where(eq(items.isActive, 1));

    const total = totalActiveItems[0].count;

    return {
        lowStock: {
            items: lowStockItems,
            count: lowStockItems.length,
            percentage: total > 0 ? ((lowStockItems.length / total) * 100).toFixed(2) : 0
        },
        outOfStock: {
            items: outOfStockItems,
            count: outOfStockItems.length,
            percentage: total > 0 ? ((outOfStockItems.length / total) * 100).toFixed(2) : 0
        },
        overstock: {
            items: overstockItems,
            count: overstockItems.length,
            percentage: total > 0 ? ((overstockItems.length / total) * 100).toFixed(2) : 0
        },
        normal: {
            count: total - lowStockItems.length - outOfStockItems.length - overstockItems.length,
            percentage: total > 0 ? (((total - lowStockItems.length - outOfStockItems.length - overstockItems.length) / total) * 100).toFixed(2) : 0
        },
        totalItems: total
    };
};

// Financial Analytics Helper
const getFinancialAnalytics = async () => {
    const financialData = await db
        .select({
            totalValue: sum(sql`${items.price} * ${items.quantity}`),
            totalItems: count(),
            avgPrice: avg(items.price),
            maxPrice: sql`MAX(${items.price})`,
            minPrice: sql`MIN(${items.price})`
        })
        .from(items)
        .where(eq(items.isActive, 1));

    // Most expensive items
    const mostExpensive = await db
        .select()
        .from(items)
        .where(eq(items.isActive, 1))
        .orderBy(desc(items.price))
        .limit(5);

    // Least expensive items
    const leastExpensive = await db
        .select()
        .from(items)
        .where(eq(items.isActive, 1))
        .orderBy(asc(items.price))
        .limit(5);

    // Price range distribution
    const priceRanges = await db
        .select({
            range: sql`
                CASE 
                    WHEN ${items.price} <= 100 THEN 'Under ₹100'
                    WHEN ${items.price} <= 500 THEN '₹100 - ₹500'
                    WHEN ${items.price} <= 2000 THEN '₹500 - ₹2000'
                    ELSE 'Over ₹2000'
                END
            `,
            count: count(),
            totalValue: sum(sql`${items.price} * ${items.quantity}`)
        })
        .from(items)
        .where(eq(items.isActive, 1))
        .groupBy(sql`
            CASE 
                WHEN ${items.price} <= 100 THEN 'Under ₹100'
                WHEN ${items.price} <= 500 THEN '₹100 - ₹500'
                WHEN ${items.price} <= 2000 THEN '₹500 - ₹2000'
                ELSE 'Over ₹2000'
            END
        `);

    return {
        totalInventoryValue: financialData[0]?.totalValue || 0,
        averageItemPrice: financialData[0]?.avgPrice || 0,
        highestPrice: financialData[0]?.maxPrice || 0,
        lowestPrice: financialData[0]?.minPrice || 0,
        mostExpensive,
        leastExpensive,
        priceDistribution: priceRanges
    };
};

// Performance Analytics Helper
const getPerformanceAnalytics = async () => {
    // Top selling items by quantity
    const topSellingByQuantity = await db
        .select({
            itemId: orderItems.itemId,
            itemName: items.name,
            totalSold: sum(orderItems.quantity),
            currentStock: items.quantity,
            stockStatus: sql`
                CASE 
                    WHEN ${items.quantity} <= ${items.minStockLevel} THEN 'Low Stock'
                    WHEN ${items.quantity} = 0 THEN 'Out of Stock'
                    ELSE 'In Stock'
                END
            `
        })
        .from(orderItems)
        .innerJoin(items, eq(orderItems.itemId, items.id))
        .groupBy(orderItems.itemId, items.name, items.quantity, items.minStockLevel)
        .orderBy(desc(sum(orderItems.quantity)))
        .limit(10);

    // Top selling items by revenue
    const topSellingByRevenue = await db
        .select({
            itemId: orderItems.itemId,
            itemName: items.name,
            totalRevenue: sum(orderItems.totalPrice),
            totalQuantitySold: sum(orderItems.quantity)
        })
        .from(orderItems)
        .innerJoin(items, eq(orderItems.itemId, items.id))
        .groupBy(orderItems.itemId, items.name)
        .orderBy(desc(sum(orderItems.totalPrice)))
        .limit(10);

    // Slow moving items (items that haven't sold much)
    const slowMovingItems = await db
        .select({
            id: items.id,
            name: items.name,
            currentStock: items.quantity,
            category: items.category,
            totalSold: sql`COALESCE(sold.total_sold, 0)`,
            daysInInventory: sql`EXTRACT(days FROM NOW() - ${items.createdAt})`
        })
        .from(items)
        .leftJoin(
            sql`(
                SELECT item_id, SUM(quantity) as total_sold 
                FROM order_items 
                GROUP BY item_id
            ) as sold`,
            sql`sold.item_id = ${items.id}`
        )
        .where(eq(items.isActive, 1))
        .orderBy(asc(sql`COALESCE(sold.total_sold, 0)`))
        .limit(10);

    return {
        topSellingByQuantity,
        topSellingByRevenue,
        slowMovingItems
    };
};

// Category Analytics Helper
const getCategoryAnalytics = async () => {
    const categoryStats = await db
        .select({
            category: items.category,
            itemCount: count(),
            totalValue: sum(sql`${items.price} * ${items.quantity}`),
            avgPrice: avg(items.price),
            lowStockCount: sql`COUNT(CASE WHEN ${items.quantity} <= ${items.minStockLevel} THEN 1 END)`,
            outOfStockCount: sql`COUNT(CASE WHEN ${items.quantity} = 0 THEN 1 END)`
        })
        .from(items)
        .where(eq(items.isActive, 1))
        .groupBy(items.category)
        .orderBy(desc(count()));

    // Calculate percentages
    const totalItems = categoryStats.reduce((sum, cat) => sum + cat.itemCount, 0);
    const totalValue = categoryStats.reduce((sum, cat) => sum + parseFloat(cat.totalValue || 0), 0);

    const categoriesWithPercentages = categoryStats.map(cat => ({
        ...cat,
        itemPercentage: totalItems > 0 ? ((cat.itemCount / totalItems) * 100).toFixed(2) : 0,
        valuePercentage: totalValue > 0 ? ((parseFloat(cat.totalValue || 0) / totalValue) * 100).toFixed(2) : 0
    }));

    return {
        categories: categoriesWithPercentages,
        totalCategories: categoryStats.length,
        summary: {
            totalItems,
            totalValue
        }
    };
};

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
    try {
        const lowStockItems = await db
            .select()
            .from(items)
            .where(and(
                sql`${items.quantity} <= ${items.minStockLevel}`,
                eq(items.isActive, 1)
            ))
            .orderBy(asc(sql`${items.quantity} - ${items.minStockLevel}`));

        return successResponse(res, 'Low stock alerts retrieved successfully', {
            items: lowStockItems,
            count: lowStockItems.length
        });
    } catch (error) {
        console.error('Error getting low stock alerts:', error);
        return errorResponse(res, 'Failed to retrieve low stock alerts', 500);
    }
};

// Get item by ID
export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Item ID is required', 400);
        }

        const item = await db
            .select()
            .from(items)
            .where(eq(items.id, parseInt(id)))
            .limit(1);

        if (item.length === 0) {
            return errorResponse(res, 'Item not found', 404);
        }

        return successResponse(res, 'Item retrieved successfully', item[0]);
    } catch (error) {
        console.error('Error getting item:', error);
        return errorResponse(res, 'Failed to retrieve item', 500);
    }
};