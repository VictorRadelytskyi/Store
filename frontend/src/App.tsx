import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/login/Login';
import {AuthProvider} from './components/context/AuthContext';
import Register from './components/Register';
import Home from './components/Home';
import Menu from './components/Menu.tsx';
import Cart from './components/Cart/Cart.tsx';
import Orders from './components/Orders/Orders.tsx';
import Product from './components/products/Product';
import Logout from './components/login/Logout.tsx';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Menu />
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/cart" element={<Cart/>} />
            <Route path="/orders" element={<Orders/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/logout" element={<Logout/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/products/:id" element={<Product/>} />
          </Routes>
        </Router>
      </AuthProvider>
  )
}

export default App
