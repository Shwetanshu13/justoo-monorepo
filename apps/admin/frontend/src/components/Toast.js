'use client';
import toast from 'react-hot-toast';

export default function Toast({ type = 'success', message, onClose }) {
    if (!message) return null;
    if (type === 'error') toast.error(message);
    else toast.success(message);
    if (onClose) setTimeout(onClose, 10);
    return null;
}
