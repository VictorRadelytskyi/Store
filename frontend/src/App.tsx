import './App.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/login/Login';
import {AuthProvider} from './components/context/AuthContext';
import Register from './components/Register';

function App() {
  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<div>Main page</div>} />
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>} />
          </Routes>
        </Router>
      </AuthProvider>
  )
}

export default App
