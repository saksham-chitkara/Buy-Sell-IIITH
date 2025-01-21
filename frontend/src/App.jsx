import { BrowserRouter ,Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import ProfilePage from './pages/profilePage';
import SearchPage from './pages/searchPage';
import ItemPage from './pages/itemPage';
import CartPage from './pages/mycartPage';
import SellPage from './pages/sellPage';
import HistoryPage from './pages/historyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<LoginPage />} />  
        <Route path ="/login" element={<LoginPage />} />
        <Route path ="/signup" element={<SignupPage />} />
        <Route path ="/profile" element={<ProfilePage />} />
        <Route path ="/search" element={<SearchPage />} />
        <Route path ="/item/:id" element={<ItemPage />} />
        <Route path ="/cart" element={<CartPage />} />
        <Route path ="/sell" element={<SellPage />} />
        <Route path ="/history" element={<HistoryPage />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
