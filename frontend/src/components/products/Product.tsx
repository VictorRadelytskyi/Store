import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { Card, Form, Alert, Button, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ProductData {
    id: number;
    name: string;
    description: string;
    price: number;
    imgPath?: string;
    category?: string;
    available?: number;
}

export default function Product(){
    const [product, setProduct] = useState<ProductData | null>(null);
    const [selected, setSelected] = useState<number>(1);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setError('Product ID not found');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(response.data.product);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.error || 'Product not found');
                } else {
                    setError('Failed to load product');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    async function addToCart(){
        if (!product) return;
        
        if (!user) {
            setError('Please log in to add items to cart');
            return;
        }
        
        if (selected > (product.available || 0)) {
            setError(`Only ${product.available} items available`);
            return;
        }
        
        setError('');
        setSuccess('');
        console.log(`Adding ${selected} of ${product.name} to cart`);

        if (user.id){
            try {
                const existingCart = JSON.parse(localStorage.getItem(`${user.id}_cart`) || "[]");
                
                const existingItemIndex = existingCart.findIndex((item: {productId: number, quantity: number}) => item.productId === product.id);
                
                if (existingItemIndex !== -1) {
                    existingCart[existingItemIndex].quantity += selected;
                } else {
                    existingCart.push({
                        productId: product.id, 
                        quantity: selected, 
                        name: product.name, 
                        price: product.price, 
                        imgPath: product.imgPath
                    });
                }
                
                localStorage.setItem(`${user.id}_cart`, JSON.stringify(existingCart));
                setSuccess("Added product to the card");
                setTimeout(() => navigate("/"), 2000);
            } catch (error) {
                setError('Failed to add item to cart');
                console.error('localStorage error:', error);
            }
        }
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <span className="visually-hidden">Loading...</span>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Alert variant="danger">
                    {error || 'Product not found'}
                    <div className="mt-3">
                        <Button variant="secondary" onClick={() => navigate('/')}>
                            ← Back to Products
                        </Button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {success && <Alert variant="success" className="mb-4">{success}</Alert>} 
            <Card className="d-flex flex-row shadow-sm border-0" style={{minHeight: "70vh"}}>
                <Card.Img
                    variant="left"
                    src={product.imgPath}
                    style={{height: "450px", width: "450px", objectFit: 'cover'}}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src="/no-img.jpg"}
                />
                <Card.Body className="d-flex flex-column ms-4 ps-4 py-4">
                    <Card.Title className="h3 mb-2">{product.name}</Card.Title>
                    <div className="mb-3">
                        <span className="badge bg-light text-dark border fs-6">{product.category}</span>
                    </div>
                    <p className="text-muted mb-4 lh-base">{product.description}</p>
                    <div className="mb-4">
                        <span className="h2 text-primary fw-bold">${product.price}</span>
                    </div>
                    <div className="mb-3">
                        <span className="text-success fw-semibold fs-5">Items available: {product.available}</span>
                    </div>
                    
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                    
                    <div className="mt-auto pt-4 border-top">
                        <Form>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold mb-3">Quantity</Form.Label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <Form.Control
                                            type="number"
                                            value={selected}
                                            onChange={e => setSelected(parseInt(e.target.value) || 1)}
                                            min={1}
                                            max={product.available || 10}
                                            required
                                            className="h-100"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Button 
                                            onClick={addToCart}
                                            disabled={!user || !product.available}
                                            variant="primary"
                                            size="lg"
                                            className="w-100"
                                        >
                                            {!user ? 'Log in to Purchase' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </div>
                            </Form.Group>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100"
                                onClick={() => navigate('/')}
                            >
                                ← Back to Products
                            </Button>
                        </Form>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}