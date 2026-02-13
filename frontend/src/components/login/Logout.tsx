import axios from 'axios';
import { Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Logout(){
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { user, token, logout} = useAuth();

    useEffect(() => {
        const handleLogout = async () => {
            if (user && token){
                try{
                    setLoading(true);
                    await axios.post('http://localhost:5000/api/users/logout', {
                        id: user.id,
                        role: user.role
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    logout();
                    setSuccess('Logged out successfully');
                    setTimeout(() => navigate('/'), 2000);

                } catch(err){
                    if (axios.isAxiosError(err)){
                        setError(err.response?.data?.error || "Error logging out");
                    } else{
                        setError('Error logging out');
                    }
                } finally {
                    setLoading(false);
                }
            } else{
                setError('To log out you should be logged in first');
            }
        };

        handleLogout();
    }, []); // Empty dependency array to run only once

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div>Logging out...</div>
            </Container>
        );
    }

    return(
        <Container className="py-5">
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            <Button className="p-3 px-4" variant="secondary" onClick={() => navigate('/')}>
                ← Back to Products
            </Button>
        </Container>
    );
}