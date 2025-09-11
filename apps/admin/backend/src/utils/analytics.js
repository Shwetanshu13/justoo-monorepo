// Analytics utility functions
import db from '../config/dbConfig.js';
import { orders, order_items, items, justoo_admins as admins, justoo_payments as payments } from '@justoo/db';
import { eq, and, between, count, sum, avg, desc, asc, sql } from 'drizzle-orm';

export const getOrderAnalytics = async (period = 'daily', startDate, endDate) => {
    try {
        // Base query conditions
        const baseConditions = [];

        if (startDate && endDate) {
            baseConditions.push(
                between(orders.createdAt, startDate, endDate)
            );
        }

        // Total orders
        const totalOrdersResult = await db
            .select({ count: count() })
            .from(orders)
            .where(and(...baseConditions));

        // Orders by status
        const ordersByStatusResult = await db
            .select({
                status: orders.status,
                count: count()
            })
            .from(orders)
            .where(and(...baseConditions))
            .groupBy(orders.status);

        // Revenue analytics
        const revenueResult = await db
            .select({
                totalRevenue: sum(orders.totalAmount),
                avgOrderValue: avg(orders.totalAmount),
                maxOrderValue: sql`MAX(${orders.totalAmount})`,
                minOrderValue: sql`MIN(${orders.totalAmount})`
            })
            .from(orders)
            .where(and(...baseConditions, eq(orders.status, 'delivered')));

        // Daily revenue trend (last 30 days)
        const dailyRevenueResult = await db
            .select({
                date: sql`DATE(${orders.createdAt})`,
                revenue: sum(orders.totalAmount),
                orderCount: count()
            })
            .from(orders)
            .where(and(
                eq(orders.status, 'delivered'),
                sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`
            ))
            .groupBy(sql`DATE(${orders.createdAt})`)
            .orderBy(sql`DATE(${orders.createdAt})`);

        return {
            totalOrders: totalOrdersResult[0]?.count || 0,
            ordersByStatus: ordersByStatusResult.reduce((acc, curr) => {
                acc[curr.status] = curr.count;
                return acc;
            }, {}),
            revenue: {
                total: revenueResult[0]?.totalRevenue || 0,
                average: revenueResult[0]?.avgOrderValue || 0,
                highest: revenueResult[0]?.maxOrderValue || 0,
                lowest: revenueResult[0]?.minOrderValue || 0
            },
            dailyTrend: dailyRevenueResult
        };
    } catch (error) {
        console.error('Error fetching order analytics:', error);
        throw error;
    }
};

export const getInventoryAnalytics = async () => {
    try {
        // Low stock items
        const lowStockResult = await db
            .select()
            .from(items)
            .where(sql`${items.quantity} <= ${items.minStockLevel}`);

        // Total items and value
        const inventoryStatsResult = await db
            .select({
                totalItems: count(),
                totalValue: sum(sql`${items.price} * ${items.quantity}`),
                avgPrice: avg(items.price)
            })
            .from(items)
            .where(eq(items.isActive, 1));

        // Category-wise distribution
        const categoryStatsResult = await db
            .select({
                category: items.category,
                itemCount: count(),
                totalValue: sum(sql`${items.price} * ${items.quantity}`)
            })
            .from(items)
            .where(eq(items.isActive, 1))
            .groupBy(items.category);

        // Top selling items (based on order_items)
        const topSellingResult = await db
            .select({
                itemId: order_items.itemId,
                itemName: items.name,
                totalSold: sum(order_items.quantity),
                totalRevenue: sum(sql`${order_items.quantity} * ${order_items.unitPrice}`)
            })
            .from(order_items)
            .innerJoin(items, eq(order_items.itemId, items.id))
            .groupBy(order_items.itemId, items.name)
            .orderBy(desc(sum(order_items.quantity)))
            .limit(10);

        return {
            lowStockItems: lowStockResult,
            totalItems: inventoryStatsResult[0]?.totalItems || 0,
            totalInventoryValue: inventoryStatsResult[0]?.totalValue || 0,
            averageItemPrice: inventoryStatsResult[0]?.avgPrice || 0,
            categoryDistribution: categoryStatsResult,
            topSellingItems: topSellingResult
        };
    } catch (error) {
        console.error('Error fetching inventory analytics:', error);
        throw error;
    }
};

export const getUserAnalytics = async () => {
    try {
        // Total users by role
        const usersByRoleResult = await db
            .select({
                role: admins.role,
                count: count()
            })
            .from(admins)
            .groupBy(admins.role);

        // Recent registrations (last 30 days)
        const recentRegistrationsResult = await db
            .select({ count: count() })
            .from(admins)
            .where(sql`${admins.createdAt} >= NOW() - INTERVAL '30 days'`);

        // Active customers (those who have placed orders)
        const activeCustomersResult = await db
            .select({ count: sql`COUNT(DISTINCT ${orders.userId})` })
            .from(orders);

        return {
            usersByRole: usersByRoleResult.reduce((acc, curr) => {
                acc[curr.role] = curr.count;
                return acc;
            }, {}),
            recentRegistrations: recentRegistrationsResult[0]?.count || 0,
            activeCustomers: activeCustomersResult[0]?.count || 0
        };
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        throw error;
    }
};

export const getPaymentAnalytics = async () => {
    try {
        // Payment method breakdown
        const paymentMethodsResult = await db
            .select({
                method: payments.method,
                count: count(),
                total: sum(payments.amount)
            })
            .from(payments)
            .where(eq(payments.status, 'completed'))
            .groupBy(payments.method);

        // Order status breakdown
        const orderStatusResult = await db
            .select({
                status: orders.status,
                count: count(),
                totalAmount: sum(orders.totalAmount)
            })
            .from(orders)
            .groupBy(orders.status);

        return {
            paymentMethods: paymentMethodsResult,
            orderStatus: orderStatusResult
        };
    } catch (error) {
        console.error('Error fetching payment analytics:', error);
        throw error;
    }
};
