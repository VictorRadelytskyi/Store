import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Alert, Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartItem from './CartItem';

interface CartItemData {
    productId: number;
    quantity: number;
    name: string;
    price: number;
    imgPath?: string;
}

export default function Cart(){
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [cartItems, setCartItems] = useState<CartItemData[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        function loadItems(){
            if (!user){
                navigate('/login');
                return;
            }
            
            try {
                const items = JSON.parse(localStorage.getItem(`${user.id}_cart`) || '[]');
                setCartItems(items);
            } catch (err) {
                console.error(`Failed to load cart items: ${err}`);
                setError(`Failed to load cart items: ${err}`);
                setCartItems([]);
            }
        }
        loadItems();
    }, [navigate, user]);

    function removeItem(productId: number){
        if (!user) return;
        
        const updatedItems = cartItems.filter(item => item.productId !== productId);
        setCartItems(updatedItems);
        localStorage.setItem(`${user.id}_cart`, JSON.stringify(updatedItems));
    };

    function updateQuantity(productId: number, newQuantity: number){
        if (!user || newQuantity < 1) return;
        
        const updatedItems = cartItems.map(item => 
            item.productId === productId 
                ? { ...item, quantity: newQuantity }
                : item
        );
        setCartItems(updatedItems);
        localStorage.setItem(`${user.id}_cart`, JSON.stringify(updatedItems));
    };

    function getTotalPrice() {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    async function checkout(){
        setError('');
        setSuccess('');
        try{
            const response = await axios.post(`http://localhost:5000/checkout`, {
                items: cartItems
            });

            setSuccess(response?.data?.message || "Placed order successfully");
            setCartItems([]);
            if (user){
                localStorage.removeItem(`${user.id}_cart`);
            }

            if (user){
                localStorage.removeItem(`${user.id}_cart`);
            }

        }catch (err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.error || 'Error during checkout');
            } else{
                setError('Error during checkout');
            }
        }
    }

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Please log in to view your cart.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">Shopping Cart</h2>
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            {cartItems.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h5>Your cart is empty</h5>
                        <p className="text-muted">Add some products to get started!</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body>
                        {cartItems.map(item => (
                            <CartItem
                                key={item.productId}
                                productId={item.productId}
                                quantity={item.quantity}
                                name={item.name}
                                price={item.price}
                                imgPath={item.imgPath}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                            />
                        ))}
                        <Row className="mt-4">
                            <Col className="text-end">
                                <h5>Total: ${getTotalPrice()}</h5>
                                <Button variant="success" className="me-2" onClick={checkout}>
                                    Checkout
                                </Button>
                                <Button variant="outline-secondary" onClick={() => navigate('/')}>
                                    Continue Shopping
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}