import app from './app.js';

const PORT = process.env.ADMIN_BACKEND_PORT || 3002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin API: http://localhost:${PORT}/api`);
});
