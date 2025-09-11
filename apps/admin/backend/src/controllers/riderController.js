// Rider Controller
import db from '../config/dbConfig.js';
import { justoo_riders as riders, orders, orderItems } from '@justoo/db';
import { eq, and, count, sum, avg, desc, asc, sql, between, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { errorResponse, successResponse } from '../utils/response.js';

// Add new rider
export const addRider = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return errorResponse(res, 'Username, email, and password are required', 400);
        }

        if (username.length < 3) {
            return errorResponse(res, 'Username must be at least 3 characters long', 400);
        }

        if (password.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters long', 400);
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(res, 'Please provide a valid email address', 400);
        }

        // Check if username or email already exists
        const existingUser = await db
            .select()
            .from(riders)
            .where(sql`${riders.username} = ${username} OR ${riders.email} = ${email}`)
            .limit(1);

        if (existingUser.length > 0) {
            const field = existingUser[0].username === username ? 'Username' : 'Email';
            return errorResponse(res, `${field} already exists`, 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create rider
        const newRider = await db
            .insert(riders)
            .values({
                username,
                email,
                password: hashedPassword,
                status: 'active',
                isActive: 1
            })
            .returning();

        const { password: _, ...riderWithoutPassword } = newRider[0];

        return successResponse(res, 'Rider added successfully', riderWithoutPassword, 201);
    } catch (error) {
        console.error('Error adding rider:', error);
        return errorResponse(res, 'Failed to add rider', 500);
    }
};

// Remove rider (soft delete)
export const removeRider = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Rider ID is required', 400);
        }

        // Check if rider exists
        const rider = await db
            .select()
            .from(riders)
            .where(eq(riders.id, parseInt(id)))
            .limit(1);

        if (rider.length === 0) {
            return errorResponse(res, 'Rider not found', 404);
        }

        // Soft delete by setting isActive to 0
        const removedRider = await db
            .update(riders)
            .set({
                isActive: 0,
                updatedAt: new Date().toISOString()
            })
            .where(eq(riders.id, parseInt(id)))
            .returning();

        const { password: _, ...riderWithoutPassword } = removedRider[0];

        return successResponse(res, 'Rider removed successfully', riderWithoutPassword);
    } catch (error) {
        console.error('Error removing rider:', error);
        return errorResponse(res, 'Failed to remove rider', 500);
    }
};

// Get all riders with pagination and filtering
export const getAllRiders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            isActive,
            sortBy = 'username',
            sortOrder = 'asc',
            search
        } = req.query;

        const offset = (page - 1) * limit;
        let query = db
            .select({
                id: riders.id,
                username: riders.username,
                email: riders.email,
                status: riders.status,
                isActive: riders.isActive,
                lastLogin: riders.lastLogin,
                createdAt: riders.createdAt,
                updatedAt: riders.updatedAt
            })
            .from(riders);

        // Apply filters
        const conditions = [];

        if (isActive !== undefined) {
            conditions.push(eq(riders.isActive, parseInt(isActive)));
        }

        if (search) {
            conditions.push(sql`${riders.username} ILIKE ${'%' + search + '%'} OR ${riders.email} ILIKE ${'%' + search + '%'}`);
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply sorting
        const sortColumn = riders[sortBy] || riders.username;
        query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));

        // Apply pagination
        const ridersList = await query.limit(parseInt(limit)).offset(offset);

        // Get total count for pagination
        let countQuery = db.select({ count: count() }).from(riders);
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
        }
        const totalRiders = await countQuery;

        return successResponse(res, 'Riders retrieved successfully', {
            riders: ridersList,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRiders[0].count / limit),
                totalItems: totalRiders[0].count,
                hasNext: page * limit < totalRiders[0].count,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting riders:', error);
        return errorResponse(res, 'Failed to retrieve riders', 500);
    }
};

// Get rider by ID
export const getRiderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return errorResponse(res, 'Rider ID is required', 400);
        }

        const rider = await db
            .select({
                id: riders.id,
                username: riders.username,
                email: riders.email,
                isActive: riders.isActive,
                lastLogin: riders.lastLogin,
                createdAt: riders.createdAt,
                updatedAt: riders.updatedAt
            })
            .from(riders)
            .where(eq(riders.id, parseInt(id)))
            .limit(1);

        if (rider.length === 0) {
            return errorResponse(res, 'Rider not found', 404);
        }

        return successResponse(res, 'Rider retrieved successfully', rider[0]);
    } catch (error) {
        console.error('Error getting rider:', error);
        return errorResponse(res, 'Failed to retrieve rider', 500);
    }
};

// Update rider information
export const updateRider = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, isActive } = req.body;

        if (!id) {
            return errorResponse(res, 'Rider ID is required', 400);
        }

        // Check if rider exists
        const existingRider = await db
            .select()
            .from(riders)
            .where(eq(riders.id, parseInt(id)))
            .limit(1);

        if (existingRider.length === 0) {
            return errorResponse(res, 'Rider not found', 404);
        }

        // Check for duplicate username/email if being updated
        if (username || email) {
            const duplicateCheck = await db
                .select()
                .from(riders)
                .where(
                    and(
                        sql`${riders.id} != ${parseInt(id)}`,
                        or(
                            username ? eq(riders.username, username) : undefined,
                            email ? eq(riders.email, email) : undefined
                        ).filter(Boolean)
                    )
                )
                .limit(1);

            if (duplicateCheck.length > 0) {
                const field = (username && duplicateCheck[0].username === username) ? 'Username' : 'Email';
                return errorResponse(res, `${field} already exists`, 409);
            }
        }

        // Update rider
        const updateData = {
            updatedAt: new Date().toISOString()
        };

        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (isActive !== undefined) updateData.isActive = parseInt(isActive);

        const updatedRider = await db
            .update(riders)
            .set(updateData)
            .where(eq(riders.id, parseInt(id)))
            .returning();

        const { password: _, ...riderWithoutPassword } = updatedRider[0];

        return successResponse(res, 'Rider updated successfully', riderWithoutPassword);
    } catch (error) {
        console.error('Error updating rider:', error);
        return errorResponse(res, 'Failed to update rider', 500);
    }
};

// Get rider analytics and performance
export const getRiderAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, riderId } = req.query;

        // Overall rider statistics
        const riderStats = await getRiderStatistics();

        // Performance analytics
        const performanceData = await getRiderPerformance(startDate, endDate, riderId);

        // Activity analytics
        const activityData = await getRiderActivity(startDate, endDate);

        const analytics = {
            overview: riderStats,
            performance: performanceData,
            activity: activityData,
            timestamp: new Date().toISOString()
        };

        return successResponse(res, 'Rider analytics retrieved successfully', analytics);
    } catch (error) {
        console.error('Error getting rider analytics:', error);
        return errorResponse(res, 'Failed to retrieve rider analytics', 500);
    }
};

// Helper function: Get rider statistics
const getRiderStatistics = async () => {
    // Total riders
    const totalRiders = await db
        .select({ count: count() })
        .from(riders);

    // Active riders
    const activeRiders = await db
        .select({ count: count() })
        .from(riders)
        .where(eq(riders.isActive, 1));

    // Inactive riders
    const inactiveRiders = await db
        .select({ count: count() })
        .from(riders)
        .where(eq(riders.isActive, 0));

    // Recent registrations (last 30 days)
    const recentRegistrations = await db
        .select({ count: count() })
        .from(riders)
        .where(sql`${riders.createdAt} >= NOW() - INTERVAL '30 days'`);

    const total = totalRiders[0].count;

    return {
        totalRiders: total,
        activeRiders: {
            count: activeRiders[0].count,
            percentage: total > 0 ? ((activeRiders[0].count / total) * 100).toFixed(2) : 0
        },
        inactiveRiders: {
            count: inactiveRiders[0].count,
            percentage: total > 0 ? ((inactiveRiders[0].count / total) * 100).toFixed(2) : 0
        },
        recentRegistrations: recentRegistrations[0].count
    };
};

// Helper function: Get rider performance (orders assigned/delivered)
const getRiderPerformance = async (startDate, endDate, riderId) => {
    // Note: This assumes orders table has a riderId field for assignment
    // If you don't have this field, you'll need to modify based on your order assignment logic

    let conditions = [];

    if (startDate && endDate) {
        conditions.push(between(orders.createdAt, startDate, endDate));
    }

    if (riderId) {
        // Assuming you have a riderId field in orders table
        // conditions.push(eq(orders.riderId, parseInt(riderId)));
    }

    // For now, returning placeholder data since order-rider assignment structure isn't clear
    return {
        note: "Order-rider assignment tracking requires additional database fields",
        placeholder: {
            totalAssignedOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0,
            averageDeliveryTime: 0,
            topPerformers: []
        }
    };
};

// Helper function: Get rider activity
const getRiderActivity = async (startDate, endDate) => {
    let query = db
        .select({
            riderId: riders.id,
            username: riders.username,
            email: riders.email,
            lastLogin: riders.lastLogin,
            isActive: riders.isActive,
            registrationDate: riders.createdAt
        })
        .from(riders)
        .orderBy(desc(riders.lastLogin));

    const riderActivity = await query.limit(20);

    // Calculate activity metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const activeToday = riderActivity.filter(rider => {
        if (!rider.lastLogin) return false;
        const lastLogin = new Date(rider.lastLogin);
        const today = new Date();
        return lastLogin.toDateString() === today.toDateString();
    }).length;

    const activeThisWeek = riderActivity.filter(rider => {
        if (!rider.lastLogin) return false;
        const lastLogin = new Date(rider.lastLogin);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastLogin >= weekAgo;
    }).length;

    const activeThisMonth = riderActivity.filter(rider => {
        if (!rider.lastLogin) return false;
        const lastLogin = new Date(rider.lastLogin);
        return lastLogin >= thirtyDaysAgo;
    }).length;

    return {
        recentActivity: riderActivity,
        activitySummary: {
            activeToday,
            activeThisWeek,
            activeThisMonth,
            totalRiders: riderActivity.length
        }
    };
};

// Change rider password
export const changeRiderPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!id || !newPassword) {
            return errorResponse(res, 'Rider ID and new password are required', 400);
        }

        if (newPassword.length < 6) {
            return errorResponse(res, 'Password must be at least 6 characters long', 400);
        }

        // Check if rider exists
        const rider = await db
            .select()
            .from(riders)
            .where(eq(riders.id, parseInt(id)))
            .limit(1);

        if (rider.length === 0) {
            return errorResponse(res, 'Rider not found', 404);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await db
            .update(riders)
            .set({
                password: hashedPassword,
                updatedAt: new Date().toISOString()
            })
            .where(eq(riders.id, parseInt(id)));

        return successResponse(res, 'Rider password updated successfully');
    } catch (error) {
        console.error('Error changing rider password:', error);
        return errorResponse(res, 'Failed to change rider password', 500);
    }
};