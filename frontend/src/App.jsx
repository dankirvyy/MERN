import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';   
import Footer from './components/Footer.jsx';   
import HomePage from './pages/HomePage.jsx'; 
import LoginPage from './pages/LoginPage.jsx'; 
import SignupPage from './pages/SignupPage.jsx'; 
import ToursPage from './pages/ToursPage.jsx';  
import RoomsPage from './pages/RoomsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import ChangeAvatarPage from './pages/ChangeAvatarPage.jsx';
import BookRoomPage from './pages/BookRoomPage.jsx';
import ConfirmBookingPage from './pages/ConfirmBookingPage.jsx';
import BookTourPage from './pages/BookTourPage.jsx'; 
import ConfirmTourBookingPage from './pages/ConfirmTourBookingPage.jsx';
import TourDetailPage from './pages/TourDetailPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminGuestsPage from './pages/AdminGuestsPage.jsx';
import AdminGuestDetailPage from './pages/AdminGuestDetailPage.jsx';
import AdminToursPage from './pages/AdminToursPage.jsx';
import AdminRoomTypesPage from './pages/AdminRoomTypesPage.jsx';
import AdminRoomsPage from './pages/AdminRoomsPage.jsx';
import AdminBookingsPage from './pages/AdminBookingsPage.jsx';
import AdminTourBookingsPage from './pages/AdminTourBookingsPage.jsx';
import AdminResourcesPage from './pages/AdminResourcesPage.jsx';
import AdminCRMPage from './pages/AdminCRMPage.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import AdminInvoicesPage from './pages/AdminInvoicesPage.jsx';
import AdminInvoiceDetailPage from './pages/AdminInvoiceDetailPage.jsx';
import AdminManageTourResourcesPage from './pages/AdminManageTourResourcesPage.jsx';
import AdminResourceCalendarPage from './pages/AdminResourceCalendarPage.jsx';
import AdminFrontDeskPage from './pages/AdminFrontDeskPage.jsx';

function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <>
            {!isAdminRoute && !isAuthRoute && <Navbar />}
            <main> 
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/tours" element={<ToursPage />} />
                    <Route path="/rooms" element={<RoomsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/tour/:tourId" element={<TourDetailPage />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/my-profile" element={<MyProfilePage />} />
                        <Route path="/edit-profile" element={<EditProfilePage />} />
                        <Route path="/change-avatar" element={<ChangeAvatarPage />} />
                        <Route path="/book/room/:roomTypeId" element={<BookRoomPage />} />
                        <Route path="/booking/confirm" element={<ConfirmBookingPage />} />
                        <Route path="/book/tour/:tourId" element={<BookTourPage />} />
                        <Route path="/booking/confirm-tour" element={<ConfirmTourBookingPage />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/guests" element={<AdminGuestsPage />} />
                        <Route path="/admin/guests/:id" element={<AdminGuestDetailPage />} />
                        <Route path="/admin/tours" element={<AdminToursPage />} />
                        <Route path="/admin/room-types" element={<AdminRoomTypesPage />} />
                        <Route path="/admin/rooms" element={<AdminRoomsPage />} />
                        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                        <Route path="/admin/front-desk" element={<AdminFrontDeskPage />} />
                        <Route path="/admin/tour-bookings" element={<AdminTourBookingsPage />} />
                        <Route path="/admin/tour-bookings/:id/manage-resources" element={<AdminManageTourResourcesPage />} />
                        <Route path="/admin/resources" element={<AdminResourcesPage />} />
                        <Route path="/admin/resources/calendar" element={<AdminResourceCalendarPage />} />
                        <Route path="/admin/crm" element={<AdminCRMPage />} />
                        <Route path="/admin/reports" element={<AdminReportsPage />} />
                        <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
                        <Route path="/admin/invoices/:id" element={<AdminInvoiceDetailPage />} />
                    </Route>
                </Routes>
            </main>
            {!isAdminRoute && !isAuthRoute && <Footer />}
        </>
    );
}

export default App;