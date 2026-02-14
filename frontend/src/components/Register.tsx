import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function Register(){
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const navigate = useNavigate();

    async function handleClick(e: React.FormEvent){
        console.log('Register clicked!');
        e.preventDefault();
        setError('');
        setSuccess('');

        try{
            console.log('request will be sent');
            const response = await axios.post('http://localhost:5000/api/users/register', {
                firstName, 
                lastName,
                email,
                password
            });

            console.log('Request was sent');

            if (response.status === 201){
                setSuccess(response.data?.message || 'User created successfully');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');

                setTimeout(() => navigate('/login'), 2000);
            }
            
        } catch(err){
            console.log(err);
            if(axios.isAxiosError(err)){
                setError(err.response?.data?.error || "Failed to register");
            } else{
                setError('Failed to register!');
            }
        }
    }

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "80vh"}}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Register</h2>
                        {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
                        {success && <Alert variant="success" className="mb-2">{success}</Alert>}
                        <Form onSubmit={handleClick}>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="firstName">First Name</Form.Label>
                                <Form.Control
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                                <Form.Control
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="email">Email</Form.Label>
                                <Form.Control
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="password">Password</Form.Label>
                                <Form.Control
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button className="mt-1 w-100" type="submit">
                                Register
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-3">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </Container>
    );
}