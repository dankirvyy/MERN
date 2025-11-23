import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
);

const AdminDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            console.log('Fetching dashboard data...');
            const token = sessionStorage.getItem('token');
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            console.log('User from localStorage:', user);

            // Check if user is admin
            if (user.role !== 'admin') {
                alert('Access denied. Admin only.');
                navigate('/');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            console.log('Making request to:', 'http://localhost:5001/api/admin/dashboard');
            const { data } = await axios.get('http://localhost:5001/api/admin/dashboard', config);
            console.log('Dashboard data received:', data);
            setDashboardData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.error('Error response:', err.response);
            setError(err.response?.data?.message || 'Failed to load dashboard');
            if (err.response?.status === 403 || err.response?.status === 401) {
                alert('Access denied. Please login as admin.');
                navigate('/login');
            }
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="text-xl">Loading dashboard...</div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="text-red-600 text-xl mb-4">Error: {error}</div>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Go Home
                    </button>
                </div>
            </AdminLayout>
        );
    }

    if (!dashboardData) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="text-xl mb-4">No dashboard data available.</div>
                    <button 
                        onClick={fetchDashboardData}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const { overview, charts } = dashboardData;

    // Chart configurations
    const doughnutData = {
        labels: charts.doughnut.labels || ['Room Bookings', 'Tour Bookings'],
        datasets: [{
            data: charts.doughnut.data || [0, 0],
            backgroundColor: ['#3B82F6', '#10B981'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    };

    const lineData = {
        labels: charts.line.labels || [],
        datasets: [{
            label: 'Revenue (₱)',
            data: charts.line.data || [],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return 'Revenue: ₱' + context.parsed.y.toLocaleString();
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '₱' + value.toLocaleString();
                    }
                }
            }
        }
    };

    return (
        <AdminLayout>
            {/* Quick Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/guests')}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
                >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-semibold text-gray-800">Guests</div>
                    <div className="text-sm text-gray-500">Manage users</div>
                </button>
                
                <button
                    onClick={() => navigate('/admin/crm')}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
                >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold text-gray-800">CRM</div>
                    <div className="text-sm text-gray-500">Customer insights</div>
                </button>
                
                <button
                    onClick={() => navigate('/admin/reports')}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
                >
                    <div className="text-2xl mb-2">📈</div>
                    <div className="font-semibold text-gray-800">Reports</div>
                    <div className="text-sm text-gray-500">Analytics</div>
                </button>
                
                <button
                    onClick={() => navigate('/admin/invoices')}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-left"
                >
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold text-gray-800">Invoices</div>
                    <div className="text-sm text-gray-500">Billing</div>
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-500 text-sm mb-2">Total Tours</div>
                    <div className="text-3xl font-bold text-blue-600">{overview.tourCount}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-500 text-sm mb-2">Total Rooms</div>
                    <div className="text-3xl font-bold text-green-600">{overview.roomCount}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-500 text-sm mb-2">Active Bookings</div>
                    <div className="text-3xl font-bold text-purple-600">{overview.activeBookingCount}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-500 text-sm mb-2">Available Resources</div>
                    <div className="text-3xl font-bold text-orange-600">{overview.resourceCount}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-500 text-sm mb-2">Tour Bookings</div>
                    <div className="text-3xl font-bold text-indigo-600">{overview.tourBookingCount}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Doughnut Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Types</h2>
                    <div style={{ height: '300px' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Line Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue (Last 7 Days)</h2>
                    <div style={{ height: '300px' }}>
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
