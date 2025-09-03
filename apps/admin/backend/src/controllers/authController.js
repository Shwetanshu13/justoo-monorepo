// Auth Controller
import { findByUsername } from '../utils/db.js';
import { comparePassword, generateToken, extractTokenFromHeader } from '../utils/auth.js';
import { unauthorizedResponse, errorResponse, successResponse } from '../utils/response.js';
import { justoo_admins as admin } from '@justoo/db';

export const signin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return errorResponse(res, 'Username and password are required', 400);
    }

    try {
        let user = await findByUsername(admin, username);
        let tableName = 'admin';

        if (!user) {
            return unauthorizedResponse(res, 'Invalid username or password');
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return unauthorizedResponse(res, 'Invalid username or password');
        }

        const token = generateToken({
            id: user.id,
            username: user.username,
            userType: tableName,
            role: user.role
        });

        // Set httpOnly cookie for session
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return successResponse(res, 'Signed in successfully', {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                userType: tableName
            }
        });
    } catch (error) {
        console.error('Error signing in:', error);
        return errorResponse(res, 'Error signing in');
    }
};

export const signout = (req, res) => {
    res.clearCookie('auth_token');
    return successResponse(res, null, 'Signed out successfully');
};

export const getMe = async (req, res) => {
    try {
        const user = req.user;
        return successResponse(res, { user }, 'User info retrieved successfully');
    } catch (error) {
        console.error('Error getting user info:', error);
        return errorResponse(res, 'Error retrieving user info');
    }
};

export const refreshToken = async (req, res) => {
    try {
        const user = req.user;

        // Generate new token
        const newToken = generateToken({
            id: user.id,
            role: user.role,
            userType: user.userType
        });

        // Set new cookie
        res.cookie('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return successResponse(res, null, 'Token refreshed successfully');
    } catch (error) {
        console.error('Error refreshing token:', error);
        return errorResponse(res, 'Error refreshing token');
    }
};
