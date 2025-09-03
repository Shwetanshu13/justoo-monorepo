'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'busy':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

const RiderCard = ({ rider, onEdit, onDelete, onToggleStatus }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <TruckIcon className="h-6 w-6 text-gray-600" />
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{rider.name}</h3>
                                <p className="text-sm text-gray-500">{rider.phone}</p>
                            </div>
                            <StatusBadge status={rider.status} />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>Vehicle: {rider.vehicle_type} - {rider.vehicle_number}</p>
                            <p>Joined: {formatDate(rider.created_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Deliveries: {rider.total_deliveries || 0}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onToggleStatus(rider)}
                            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded ${rider.status === 'active'
                                    ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                                    : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {rider.status === 'active' ? (
                                <>
                                    <XCircleIcon className="h-3 w-3 mr-1" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                    Activate
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => onEdit(rider)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PencilIcon className="h-3 w-3 mr-1" />
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(rider)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <TrashIcon className="h-3 w-3 mr-1" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RiderModal = ({ isOpen, onClose, onSubmit, rider, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicle_type: 'bike',
        vehicle_number: '',
        license_number: '',
        status: 'active',
    });

    useEffect(() => {
        if (rider) {
            setFormData({
                name: rider.name || '',
                phone: rider.phone || '',
                email: rider.email || '',
                vehicle_type: rider.vehicle_type || 'bike',
                vehicle_number: rider.vehicle_number || '',
                license_number: rider.license_number || '',
                status: rider.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                email: '',
                vehicle_type: 'bike',
                vehicle_number: '',
                license_number: '',
                status: 'active',
            });
        }
    }, [rider, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {rider ? 'Edit Rider' : 'Add New Rider'}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter rider name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter phone number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter email address"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Vehicle Type *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.vehicle_type}
                                                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                >
                                                    <option value="bike">Bike</option>
                                                    <option value="scooter">Scooter</option>
                                                    <option value="car">Car</option>
                                                    <option value="van">Van</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Vehicle Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.vehicle_number}
                                                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="KA01AB1234"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                License Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.license_number}
                                                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter license number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="busy">Busy</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (rider ? 'Update' : 'Create')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function RidersPage() {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingRider, setEditingRider] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/riders');

            if (response.success) {
                setRiders(response.data);
            } else {
                // Set dummy data for demo
                setRiders([
                    {
                        id: 1,
                        name: 'Rajesh Kumar',
                        phone: '+91 9876543210',
                        email: 'rajesh@example.com',
                        vehicle_type: 'bike',
                        vehicle_number: 'KA01AB1234',
                        license_number: 'KA0220200012345',
                        status: 'active',
                        total_deliveries: 45,
                        created_at: '2024-01-10T00:00:00Z'
                    },
                    {
                        id: 2,
                        name: 'Suresh Sharma',
                        phone: '+91 9876543211',
                        email: 'suresh@example.com',
                        vehicle_type: 'scooter',
                        vehicle_number: 'KA02CD5678',
                        license_number: 'KA0220200023456',
                        status: 'busy',
                        total_deliveries: 32,
                        created_at: '2024-01-08T00:00:00Z'
                    },
                    {
                        id: 3,
                        name: 'Amit Singh',
                        phone: '+91 9876543212',
                        email: 'amit@example.com',
                        vehicle_type: 'bike',
                        vehicle_number: 'KA03EF9012',
                        license_number: 'KA0220200034567',
                        status: 'inactive',
                        total_deliveries: 18,
                        created_at: '2024-01-05T00:00:00Z'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching riders:', error);
            toast.error('Failed to fetch riders');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRider = () => {
        setEditingRider(null);
        setShowModal(true);
    };

    const handleEditRider = (rider) => {
        setEditingRider(rider);
        setShowModal(true);
    };

    const handleDeleteRider = async (rider) => {
        if (window.confirm(`Are you sure you want to delete rider ${rider.name}?`)) {
            try {
                const response = await api.delete(`/riders/${rider.id}`);

                if (response.success) {
                    toast.success('Rider deleted successfully');
                    fetchRiders();
                } else {
                    toast.error(response.error || 'Failed to delete rider');
                }
            } catch (error) {
                console.error('Error deleting rider:', error);
                toast.error('Failed to delete rider');
            }
        }
    };

    const handleToggleStatus = async (rider) => {
        const newStatus = rider.status === 'active' ? 'inactive' : 'active';

        try {
            const response = await api.put(`/riders/${rider.id}`, { status: newStatus });

            if (response.success) {
                toast.success(`Rider ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
                fetchRiders();
            } else {
                toast.error(response.error || 'Failed to update rider status');
            }
        } catch (error) {
            console.error('Error updating rider status:', error);
            toast.error('Failed to update rider status');
        }
    };

    const handleSubmitRider = async (formData) => {
        try {
            setSubmitting(true);

            let response;
            if (editingRider) {
                response = await api.put(`/riders/${editingRider.id}`, formData);
            } else {
                response = await api.post('/riders', formData);
            }

            if (response.success) {
                toast.success(`Rider ${editingRider ? 'updated' : 'created'} successfully`);
                setShowModal(false);
                fetchRiders();
            } else {
                toast.error(response.error || `Failed to ${editingRider ? 'update' : 'create'} rider`);
            }
        } catch (error) {
            console.error('Error submitting rider:', error);
            toast.error(`Failed to ${editingRider ? 'update' : 'create'} rider`);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRiders = riders.filter(rider => {
        const matchesSearch = rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rider.phone.includes(searchTerm) ||
            rider.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || rider.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusCount = (status) => {
        return riders.filter(rider => rider.status === status).length;
    };

    return (
        <div>
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Riders Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage delivery riders and their details
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={handleAddRider}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Rider
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <TruckIcon className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Riders</dt>
                                    <dd className="text-lg font-medium text-gray-900">{riders.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('active')}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                    <TruckIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Busy</dt>
                                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('busy')}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                    <XCircleIcon className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Inactive</dt>
                                    <dd className="text-lg font-medium text-gray-900">{getStatusCount('inactive')}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search riders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="busy">Busy</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="text-sm text-gray-500 flex items-center">
                            Showing {filteredRiders.length} of {riders.length} riders
                        </div>
                    </div>
                </div>
            </div>

            {/* Riders Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredRiders.length === 0 ? (
                <div className="text-center py-12">
                    <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No riders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || selectedStatus !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Get started by adding a new rider.'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRiders.map((rider) => (
                        <RiderCard
                            key={rider.id}
                            rider={rider}
                            onEdit={handleEditRider}
                            onDelete={handleDeleteRider}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <RiderModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitRider}
                rider={editingRider}
                loading={submitting}
            />
        </div>
    );
}
