import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Alert, Container, Button} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderItem from './OrderItem';

// API response type for orders (what comes from the backend)
interface OrderApiResponse {
    id: number;
    totalPrice: number;
    status: string;
}

// Component type for orders with details (what we use in the frontend)
interface OrderWithDetails {
    id: number;
    details: DetailsData[];
    totalPrice: number;
    status: string;
}

interface DetailsData {
    productId: number;
    quantity: number;
    name: string;
    price: number;
    imgPath?: string;
}

export default function Orders(){
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [ordersWithDetails, setOrdersWithDetails] = useState<OrderWithDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    async function getDetails(orderId: number): Promise<DetailsData[]>{
        try{
            const order = await axios.get(`http://localhost:5000/api/orders/${orderId}`)
            .then(response => response.data)
            .then(data => data.order);

            const items = order.items;
            interface OrderItemResponse {
                productId: number;
                quantity: number;
            }

            interface ProductResponse {
                product: {
                    id: number;
                    name: string;
                    price: number;
                    imgPath?: string;
                }
            }

            if (items.length === 0) {
                setError(`Failed to get details of order ${orderId}`);
                return [];
            }

            // Wait for all product details to be fetched
            const details = await Promise.all(
                items.map(async (item: OrderItemResponse) => {
                    console.log('Item:', item, 'ProductId:', item.productId);
                    const product = await axios.get<ProductResponse>(`http://localhost:5000/api/products/${item.productId}`);
                    return {
                        productId: product.data.product.id, 
                        name: product.data.product.name, 
                        price: product.data.product.price, 
                        imgPath: product.data.product.imgPath, 
                        quantity: item.quantity
                    };
                })
            );

            return details;
        }catch (err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.error || `Failed to get details of order ${orderId}`);
            } else{
                setError(`Failed to get details of order ${orderId}`);
            }
            return [];
        }
    }

    useEffect(() => {
        async function loadOrders(){
            setSuccess('');
            setError('');
            if (!user){
                navigate('/login');
                return;
            }
            
            try {
                const response = await axios.get(`http://localhost:5000/api/orders/user_orders/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const ordersData = response?.data?.orders || [];
                
                // Fetch details for each order
                setLoading(true);
                const ordersWithDetailsData = await Promise.all(
                    ordersData.map(async (order: OrderApiResponse) => {
                        const details = await getDetails(order.id);
                        return { ...order, details };
                    })
                );
                setOrdersWithDetails(ordersWithDetailsData);
                setLoading(false);
            } catch (err) {
                console.error(`Failed to load orders: ${err}`);
                setError(`Failed to load orders: ${err}`);
                setOrdersWithDetails([]);
                setLoading(false);
            }
        }
        loadOrders();
    }, [navigate, user, token]);

    async function cancelOrder(orderId: number){
        setError('');
        setSuccess('');
        try{
            const response = await axios.patch(`http://localhost:5000/api/orders/cancel/${orderId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSuccess(response?.data?.message || "Cancelled order successfully");
            
            // Update the local state to reflect the cancellation
            setOrdersWithDetails(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));

        }catch (err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.error || 'Failed to cancel order');
            } else{
                setError('Failed to cancel order');
            }
        }
    }

    // async function displayOrder(order: OrderItemData){
    //     const details = await getDetails(order.id);
    //     return (
    //         <OrderItem
    //             key={order.id}
    //             orderId={order.id}
    //             totalPrice={order.totalPrice}
    //             status={order.status}
    //             details={details}
    //             cancelOrder={cancelOrder}
    //         />
    //     );
    // }
    
    return (
        <Container>
            <h2 className="mb-4">My Orders</h2>
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {loading ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <p>Loading your orders...</p>
                    </Card.Body>
                </Card>
            ) : ordersWithDetails.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-5">
                        <h5>You don't have any orders</h5>
                        <p className="text-muted">Add some orders to get started!</p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>  
            ) : (
                <div>
                    {ordersWithDetails.map(order => (
                        <OrderItem
                            key={order.id}
                            orderId={order.id}
                            totalPrice={order.totalPrice}
                            status={order.status}
                            details={order.details}
                            cancelOrder={cancelOrder}
                        />
                    ))}
                </div>
            )}

        </Container>
    );
}