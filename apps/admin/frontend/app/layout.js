import './globals.css';
import Providers from './providers';

export const metadata = {
    title: 'Admin Dashboard - Justoo',
    description: 'Super Admin Dashboard for managing inventory and admins',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-50 text-gray-900">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
