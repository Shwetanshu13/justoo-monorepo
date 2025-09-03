import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
    title: 'Admin Dashboard - Justoo',
    description: 'Super Admin Dashboard for managing inventory and admins',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-50 text-gray-900">
                <AuthProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
