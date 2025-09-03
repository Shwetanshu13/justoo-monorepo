'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { inventoryAPI } from '@/lib/api';
import { UNITS } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EditItemPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [item, setItem] = useState(null);
    const router = useRouter();
    const params = useParams();
    const itemId = params.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            price: '',
            quantity: '',
            minStockLevel: 10,
            discount: 0,
            unit: 'pieces',
            category: '',
            isActive: 1
        }
    });

    // Load item data on mount
    useEffect(() => {
        const loadItem = async () => {
            try {
                setIsLoading(true);
                const response = await inventoryAPI.getItemById(itemId);
                const itemData = response.data.data;
                setItem(itemData);

                // Populate form with existing data
                reset({
                    name: itemData.name || '',
                    description: itemData.description || '',
                    price: itemData.price || '',
                    quantity: itemData.quantity || '',
                    minStockLevel: itemData.minStockLevel || 10,
                    discount: itemData.discount || 0,
                    unit: itemData.unit || 'pieces',
                    category: itemData.category || '',
                    isActive: itemData.isActive || 1
                });
            } catch (error) {
                console.error('Error loading item:', error);
                const message = error.response?.data?.message || 'Failed to load item';
                toast.error(message);
                router.push('/dashboard/inventory');
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            loadItem();
        }
    }, [itemId, reset, router]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Convert string values to proper types
            const itemData = {
                ...data,
                price: parseFloat(data.price),
                quantity: parseInt(data.quantity),
                minStockLevel: parseInt(data.minStockLevel),
                discount: parseFloat(data.discount),
                isActive: parseInt(data.isActive)
            };

            await inventoryAPI.updateItem(itemId, itemData);
            toast.success('Item updated successfully!');
            router.push('/dashboard/inventory');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update item';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <LoadingSpinner />
                </div>
            </DashboardLayout>
        );
    }

    if (!item) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Item not found</h3>
                    <p className="text-gray-500 mb-4">The item you're trying to edit could not be found.</p>
                    <button
                        onClick={() => router.push('/dashboard/inventory')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Back to Inventory
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
                    <p className="mt-3 text-base text-gray-600">
                        Update the details for <span className="font-semibold text-gray-900">{item.name}</span>.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white shadow-lg ring-1 ring-gray-900/10 rounded-xl overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Item Name */}
                            <div className="lg:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: 'Item name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                    placeholder="Enter item name"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    {...register('category')}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                    placeholder="Enter category"
                                />
                            </div>

                            {/* Unit */}
                            <div>
                                <label htmlFor="unit" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Unit *
                                </label>
                                <select
                                    {...register('unit', { required: 'Unit is required' })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 px-4 py-3 text-sm"
                                >
                                    {Object.entries(UNITS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.unit.message}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Price *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('price', {
                                            required: 'Price is required',
                                            min: { value: 0, message: 'Price must be positive' }
                                        })}
                                        className="block w-full pl-8 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.price.message}</p>
                                )}
                            </div>

                            {/* Discount */}
                            <div>
                                <label htmlFor="discount" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Discount (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        {...register('discount', {
                                            min: { value: 0, message: 'Discount cannot be negative' },
                                            max: { value: 100, message: 'Discount cannot exceed 100%' }
                                        })}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">%</span>
                                    </div>
                                </div>
                                {errors.discount && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.discount.message}</p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Current Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('quantity', {
                                        required: 'Quantity is required',
                                        min: { value: 0, message: 'Quantity cannot be negative' }
                                    })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                    placeholder="0"
                                />
                                {errors.quantity && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.quantity.message}</p>
                                )}
                            </div>

                            {/* Min Stock Level */}
                            <div>
                                <label htmlFor="minStockLevel" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Minimum Stock Level *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('minStockLevel', {
                                        required: 'Minimum stock level is required',
                                        min: { value: 0, message: 'Minimum stock level cannot be negative' }
                                    })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm"
                                    placeholder="10"
                                />
                                {errors.minStockLevel && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.minStockLevel.message}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="isActive" className="block text-sm font-semibold text-gray-800 mb-2">
                                    Status
                                </label>
                                <select
                                    {...register('isActive')}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 px-4 py-3 text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-400 px-4 py-3 text-sm resize-none"
                                placeholder="Enter item description (optional)"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/inventory')}
                                className="inline-flex justify-center items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update Item'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
