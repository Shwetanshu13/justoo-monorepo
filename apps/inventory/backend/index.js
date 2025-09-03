import express from 'express';
import cors from 'cors';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Inventory API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Route not found'
//     });
// });

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Inventory API server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`� Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`�📦 Inventory API: http://localhost:${PORT}/api/inventory`);
    console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`👤 Default admin: username=admin, password=admin123`);
});



