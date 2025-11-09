import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';   // Also good to add .jsx here
import Footer from './components/Footer.jsx';   // Also good to add .jsx here
import HomePage from './pages/HomePage.jsx'; // <-- THE FIX
import LoginPage from './pages/LoginPage.jsx'; // Also good to add .jsx here
import SignupPage from './pages/SignupPage.jsx'; // Also good to add .jsx here
import ToursPage from './pages/ToursPage.jsx';  // Also good to add .jsx here
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

function App() {
    return (
        <>
            <Navbar />
            <main> 
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/tours" element={<ToursPage />} />
                    <Route path="/rooms" element={<RoomsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/tour/:tourId" element={<TourDetailPage />} />
                    {/* 2. Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/my-profile" element={<MyProfilePage />} />
                        <Route path="/edit-profile" element={<EditProfilePage />} />
                        <Route path="/change-avatar" element={<ChangeAvatarPage />} />
                        <Route path="/book/room/:roomTypeId" element={<BookRoomPage />} />
                        <Route path="/booking/confirm" element={<ConfirmBookingPage />} />
                        <Route path="/book/tour/:tourId" element={<BookTourPage />} />
                        <Route path="/booking/confirm-tour" element={<ConfirmTourBookingPage />} />
                    </Route>
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;