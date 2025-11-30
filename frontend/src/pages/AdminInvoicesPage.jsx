import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminInvoicesPage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'older'
    const itemsPerPage = 10;

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [sortOrder]);

    const fetchInvoices = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/invoices', config);
            
            // Sort invoices
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a.issue_date);
                const dateB = new Date(b.issue_date);
                return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
            });
            
            setInvoices(sortedData);
            setCurrentPage(1); // Reset to first page when sorting changes
            setLoading(false);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get('http://localhost:5001/api/admin/invoices/stats', config);
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleMarkPaid = async (id) => {
        if (!confirm('Mark this invoice as paid?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.put(`http://localhost:5001/api/admin/invoices/${id}/mark-paid`, {}, config);
            alert('Invoice marked as paid');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating invoice');
        }
    };

    const handleViewInvoice = (id) => {
        navigate(`/admin/invoices/${id}`);
    };

    const handleDownloadPDF = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/admin/invoices/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Error downloading PDF');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading invoices...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Invoice Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Invoices</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalInvoices || 0}</p>
                            </div>
                            <div className="bg-blue-400 rounded-full p-3">
                                <span className="text-2xl">📄</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Paid</p>
                                <p className="text-3xl font-bold mt-1">{stats.paidInvoices || 0}</p>
                            </div>
                            <div className="bg-green-400 rounded-full p-3">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Unpaid</p>
                                <p className="text-3xl font-bold mt-1">{stats.unpaidInvoices || 0}</p>
                            </div>
                            <div className="bg-red-400 rounded-full p-3">
                                <span className="text-2xl">❌</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Total Amount</p>
                                <p className="text-2xl font-bold mt-1">₱{(stats.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-purple-400 rounded-full p-3">
                                <span className="text-2xl">💵</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Outstanding</p>
                                <p className="text-2xl font-bold mt-1">₱{(stats.outstandingAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-400 rounded-full p-3">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                        <option value="recent">Recent</option>
                        <option value="older">Older</option>
                    </select>
                    <span className="text-sm text-gray-500">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, invoices.length)} - {Math.min(currentPage * itemsPerPage, invoices.length)} of {invoices.length} invoices
                    </span>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">All Invoices</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(() => {
                                const startIndex = (currentPage - 1) * itemsPerPage;
                                const endIndex = startIndex + itemsPerPage;
                                const currentInvoices = invoices.slice(startIndex, endIndex);
                                
                                return currentInvoices.length > 0 ? (
                                    currentInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{invoice.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {invoice.guest?.first_name} {invoice.guest?.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {invoice.booking_id ? 'Room Booking' : 'Tour Booking'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.issue_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₱{parseFloat(invoice.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                invoice.status === 'paid' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : invoice.status === 'partial'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : invoice.status === 'refunded'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {invoice.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Invoice"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPDF(invoice.id)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Download PDF"
                                                >
                                                    📄 PDF
                                                </button>
                                                {invoice.status !== 'paid' && invoice.status !== 'refunded' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(invoice.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Mark as Paid"
                                                    >
                                                        ✅ Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No invoices found
                                    </td>
                                </tr>
                            );
                            })()}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {invoices.length > itemsPerPage && (
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(invoices.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{Math.ceil(invoices.length / itemsPerPage)}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {[...Array(Math.ceil(invoices.length / itemsPerPage))].map((_, idx) => (
                                        <button
                                            key={idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === idx + 1
                                                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(invoices.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminInvoicesPage;
