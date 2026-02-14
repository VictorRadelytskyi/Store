import {useState} from 'react';
import { useAuth } from '../context/AuthContext';
import {Container, Form, Button, Alert, Card} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login(){
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const { login } = useAuth();
    const navigate = useNavigate(); 

    async function handleClick(e: React.FormEvent){
        e.preventDefault();
        setError('');

        try{
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email, 
                password
            });

            login(
                response.data.accessToken, 
                response.data.refreshToken, 
                response.data.userId, 
                response.data.role,
                response.data.firstName,
                response.data.lastName
            );
            navigate('/');
        }catch(err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.err || 'Error logging in');
            } else{
                setError('Error logging in');
            }
        }
    }

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Log In</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="loginEmail">Email</Form.Label>
                                <Form.Control
                                    id="loginEmail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="loginPassword">Password</Form.Label>
                                <Form.Control
                                    id="loginPassword"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button onClick={handleClick} className="mt-4 p-3 px-4">
                                Log In
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-3">
                    Need an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </Container>
    );
}