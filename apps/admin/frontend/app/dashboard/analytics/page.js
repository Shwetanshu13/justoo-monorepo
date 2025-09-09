'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import {
    ChartBarIcon,
    CurrencyRupeeIcon,
    ShoppingBagIcon,
    TruckIcon,
    UsersIcon,
    CalendarDaysIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                                {change && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {changeType === 'increase' ? (
                                            <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                                        )}
                                        <span className="sr-only">
                                            {changeType === 'increase' ? 'Increased' : 'Decreased'} by
                                        </span>
                                        {change}
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChartPlaceholder = ({ title, description }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">{title}</p>
                    <p className="text-sm text-gray-400 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
};

const TopProducts = ({ products }) => {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Top Selling Products
                </h3>
                <div className="space-y-3">
                    {products.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">₹{product.revenue}</p>
                                <p className="text-sm text-gray-500">{product.sales} sold</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RecentOrders = ({ orders }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'out_for_delivery':
                return 'bg-blue-100 text-blue-800';
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Orders
                </h3>
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{order.order_id}</p>
                                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">₹{order.total_amount}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeRiders: 0,
        totalCustomers: 0,
        conversionRate: 0,
    });
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [dateRange, setDateRange] = useState('30'); // days
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // In a real app, this would fetch from the API
            // const response = await api.get(`/analytics/overview?days=${dateRange}`);

            // For now, set dummy data
            setAnalytics({
                totalRevenue: 125430,
                totalOrders: 342,
                averageOrderValue: 366.75,
                activeRiders: 12,
                totalCustomers: 186,
                conversionRate: 3.2,
            });

            setTopProducts([
                {
                    id: 1,
                    name: 'Premium Organic Coffee',
                    category: 'Beverages',
                    sales: 45,
                    revenue: 13455
                },
                {
                    id: 2,
                    name: 'Fresh Milk (1L)',
                    category: 'Dairy',
                    sales: 38,
                    revenue: 2470
                },
                {
                    id: 3,
                    name: 'Basmati Rice (5kg)',
                    category: 'Grains',
                    sales: 25,
                    revenue: 21250
                },
                {
                    id: 4,
                    name: 'Olive Oil (500ml)',
                    category: 'Oils',
                    sales: 22,
                    revenue: 7040
                },
                {
                    id: 5,
                    name: 'Fresh Apples (1kg)',
                    category: 'Fruits',
                    sales: 18,
                    revenue: 3240
                }
            ]);

            setRecentOrders([
                {
                    id: 1,
                    order_id: 'ORD-001',
                    customer_name: 'John Doe',
                    total_amount: 450,
                    status: 'delivered'
                },
                {
                    id: 2,
                    order_id: 'ORD-002',
                    customer_name: 'Jane Smith',
                    total_amount: 320,
                    status: 'out_for_delivery'
                },
                {
                    id: 3,
                    order_id: 'ORD-003',
                    customer_name: 'Bob Johnson',
                    total_amount: 180,
                    status: 'preparing'
                },
                {
                    id: 4,
                    order_id: 'ORD-004',
                    customer_name: 'Alice Brown',
                    total_amount: 275,
                    status: 'delivered'
                }
            ]);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Analytics & Reports
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive business analytics and performance metrics
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value={`₹${analytics.totalRevenue.toLocaleString()}`}
                    change="+12.3%"
                    changeType="increase"
                    icon={CurrencyRupeeIcon}
                    color="green"
                />
                <MetricCard
                    title="Total Orders"
                    value={analytics.totalOrders.toLocaleString()}
                    change="+8.1%"
                    changeType="increase"
                    icon={ShoppingBagIcon}
                    color="blue"
                />
                <MetricCard
                    title="Average Order Value"
                    value={`₹${analytics.averageOrderValue.toFixed(2)}`}
                    change="+4.2%"
                    changeType="increase"
                    icon={ChartBarIcon}
                    color="purple"
                />
                <MetricCard
                    title="Active Riders"
                    value={analytics.activeRiders}
                    change="+2"
                    changeType="increase"
                    icon={TruckIcon}
                    color="orange"
                />
                <MetricCard
                    title="Total Customers"
                    value={analytics.totalCustomers}
                    change="+15.7%"
                    changeType="increase"
                    icon={UsersIcon}
                    color="blue"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${analytics.conversionRate}%`}
                    change="-0.3%"
                    changeType="decrease"
                    icon={CalendarDaysIcon}
                    color="red"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartPlaceholder
                    title="Revenue Trends"
                    description="Monthly revenue comparison and growth trends"
                />
                <ChartPlaceholder
                    title="Order Analytics"
                    description="Order volume and delivery performance metrics"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartPlaceholder
                    title="Customer Demographics"
                    description="Customer distribution and behavior analysis"
                />
                <ChartPlaceholder
                    title="Product Performance"
                    description="Best selling products and category insights"
                />
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProducts products={topProducts} />
                <RecentOrders orders={recentOrders} />
            </div>

            {/* Export Options */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Export Reports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        Sales Report (PDF)
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <ShoppingBagIcon className="h-4 w-4 mr-2" />
                        Orders Report (CSV)
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Customer Report (Excel)
                    </button>
                </div>
            </div>

            {/* Note about chart integration */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ChartBarIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Chart Integration
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Interactive charts can be integrated using libraries like Chart.js, Recharts, or D3.js.
                                The placeholders above show where the actual charts would be rendered with real data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
