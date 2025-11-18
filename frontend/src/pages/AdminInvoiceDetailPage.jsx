import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminInvoiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const { data } = await axios.get(`http://localhost:5001/api/admin/invoices/${id}`, config);
            setInvoice(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
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
        } catch {
            alert('Error downloading PDF');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Loading invoice...</div>
            </AdminLayout>
        );
    }

    if (!invoice) {
        return (
            <AdminLayout>
                <div className="text-center py-12">Invoice not found</div>
            </AdminLayout>
        );
    }

    const isRoomBooking = !!invoice.Booking;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <button
                        onClick={() => navigate('/admin/invoices')}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to Invoices
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            🖨️ Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            📄 Download PDF
                        </button>
                    </div>
                </div>

                {/* Invoice */}
                <div className="bg-white shadow-lg rounded-lg p-8">
                    {/* Header */}
                    <div className="border-b pb-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                                <p className="text-gray-600 mt-2">Invoice #{invoice.id}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-gray-800">Visit Mindoro Resort</h2>
                                <p className="text-gray-600 text-sm mt-1">Oriental Mindoro, Philippines</p>
                                <p className="text-gray-600 text-sm">contact@visitmindoro.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Guest & Invoice Info */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
                            <div className="text-gray-800">
                                <p className="font-medium">{invoice.guest?.first_name} {invoice.guest?.last_name}</p>
                                <p className="text-sm text-gray-600">{invoice.guest?.email}</p>
                                {invoice.guest?.phone_number && (
                                    <p className="text-sm text-gray-600">{invoice.guest?.phone_number}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-sm text-gray-600">Issue Date: </span>
                                <span className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-sm text-gray-600">Due Date: </span>
                                <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                                    invoice.status === 'paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : invoice.status === 'partial'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {invoice.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">BOOKING DETAILS:</h3>
                        {isRoomBooking ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Room Type:</p>
                                    <p className="font-medium">{invoice.Booking?.Room?.RoomType?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Room Number:</p>
                                    <p className="font-medium">#{invoice.Booking?.Room?.room_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Check-in:</p>
                                    <p className="font-medium">{new Date(invoice.Booking?.check_in_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Check-out:</p>
                                    <p className="font-medium">{new Date(invoice.Booking?.check_out_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Tour:</p>
                                    <p className="font-medium">{invoice.TourBooking?.Tour?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Number of Pax:</p>
                                    <p className="font-medium">{invoice.TourBooking?.number_of_pax}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Booking Date:</p>
                                    <p className="font-medium">{new Date(invoice.TourBooking?.booking_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Invoice Items */}
                    <div className="mb-6">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoice.InvoiceItems && invoice.InvoiceItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 text-right">₱{parseFloat(item.total_price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                        <div className="flex justify-end">
                            <div className="w-64">
                                <div className="flex justify-between py-2 text-lg font-bold">
                                    <span>TOTAL:</span>
                                    <span>₱{parseFloat(invoice.total_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
                        <p>Thank you for your business!</p>
                        <p className="mt-2">For inquiries, please contact us at contact@visitmindoro.com</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminInvoiceDetailPage;
