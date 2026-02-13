import { useState, useEffect } from 'react';
import Item from './products/Item.tsx';
import axios from 'axios';
import { Alert, Card, Container, Form, Row, Col} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imgPath?: string;
    category?: string;
    available?: number;
}

export default function Home(){
    const [products, setProducts] = useState<Product[]>([]);
    const [query, setQuery] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const handleProductClick = (productId: number) => {
        navigate(`/products/${productId}`);
    };

    async function getProducts(searchQuery: string = '', selectedCategory: string = ''){
        try{
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            
            console.log('Sending category:', selectedCategory); // Debug log
            
            const response = await axios.get(`http://localhost:5000/api/products?${params}`);
            setProducts(response.data);
        }catch (err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.error || 'Error getting products');
            } else{
                setError('Error getting products');
            }
        }
    }

    async function getCategories(){
        try{
            const response = await axios.get(`http://localhost:5000/api/products/categories`);
            setCategories(response.data);
            console.log(categories);
        }catch (err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.error || 'Error getting products');
            } else{
                setError('Error getting products');
            }
        }
    }

    useEffect(() => {
        const initData = async () => {
            try {
                await getProducts();
                await getCategories();
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };

        initData();
    }, []);
        

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        getProducts(query, category);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            getProducts(query, category);
        }
    };

    return (
        <Container>
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                    <Form onSubmit={handleSearch}>
                        <Row>
                            <Col md={8}>
                                <Form.Control 
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for products"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    value={category}
                                    onChange={e => {
                                        setCategory(e.target.value);
                                        getProducts('', e.target.value);
                                    }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form>
                    
                    <div className="mt-4">
                        {products.length > 0 ? (
                            <Row>
                                {products.map(product => (
                                    <Col 
                                        key={product.id} 
                                        md={4} 
                                        className="mb-3"
                                    >
                                        <Item 
                                            name={product.name} 
                                            description={product.description}  
                                            price={product.price}
                                            imgPath={product.imgPath || '/no-img.jpg'}
                                            onClick={() => handleProductClick(product.id)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <p className="text-center text-muted">No products found</p>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}