'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Edit2, Save, X } from 'lucide-react';

export default function TermsAndConditionsPage() {
    // State to hold the fetched content and metadata
    const [content, setContent] = useState('');
    const [updatedAt, setUpdatedAt] = useState(null);
    
    // State for the editable content
    const [editContent, setEditContent] = useState('');
    
    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const { tokens } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // --- 1. GET API: Fetch Terms and Conditions ---
    const fetchTerms = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/terms/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                // Handle 404/No content gracefully, treat it as empty
                if (response.status === 404) {
                    setContent('No terms and conditions found. Click Edit to create them.');
                    setEditContent('');
                    return;
                }
                throw new Error('Failed to fetch terms and conditions');
            }

            const data = await response.json();
            
            // Set state for viewing
            setContent(data.content || 'No content available.');
            setUpdatedAt(data.updated_at);
            
            // Set state for editing
            setEditContent(data.content || '');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTerms();
    }, [tokens]);


    // --- 2. PUT API: Update Terms and Conditions ---
    const handleUpdate = async () => {
        if (!editContent.trim()) {
            setError('Content cannot be empty.');
            return;
        }

        setError('');
        setSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/terms/`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: editContent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.detail || 'Failed to update content';
                throw new Error(errorMessage);
            }

            // Success: Refetch data, exit editing mode
            await fetchTerms(); 
            setIsEditing(false);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };
    
    const handleCancel = () => {
        // Reset edit content to the last fetched content and exit editing mode
        setEditContent(content);
        setIsEditing(false);
        setError('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-600" size={32} />
                <span className="ml-3 text-slate-700">Loading Terms...</span>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 max-w-full mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">Company Terms & Conditions</h1>
            
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            
            {/* Action Bar */}
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-md text-slate-900 font-semibold">
                    Last Updated: {formatDate(updatedAt)}
                </p>
                
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition-colors"
                        >
                            <X size={16} /> Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Edit2 size={16} /> Edit Terms
                    </button>
                )}
            </div>
            
            {/* Content Display/Edit Area */}
            <div className="bg-white p-8 rounded-lg shadow">
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={20}
                        className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Enter the full terms and conditions content here (Markdown or plain text)"
                    />
                ) : (
                    <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
                        {/* Use a library like 'react-markdown' if you expect Markdown formatting */}
                        {content}
                    </div>
                )}
            </div>
        </div>
    );
}