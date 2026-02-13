import { Row, Col, Button, Card, Badge } from 'react-bootstrap';

interface OrderItemProps {
    orderId: number;
    status: string;
    details: DetailsData[];
    totalPrice: number;
    cancelOrder: (orderId: number) => void;
}

interface DetailsData {
    productId: number;
    quantity: number;
    name: string;
    price: number;
    imgPath?: string;
}

export default function OrderItem({orderId, cancelOrder, totalPrice, details, status}: OrderItemProps){
    const getStatusVariant = (status: string) => {
        switch(status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const canCancel = status.toLowerCase() === 'pending' || status.toLowerCase() === 'confirmed';

    return(
        <Card className="mb-3">
            <Card.Header>
                <Row className="align-items-center">
                    <Col>
                        <h6 className="mb-0">Order #{orderId}</h6>
                    </Col>
                    <Col xs="auto">
                        <Badge bg={getStatusVariant(status)} className="me-2">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        {canCancel && (
                            <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => cancelOrder(orderId)}
                            >
                                Cancel Order
                            </Button>
                        )}
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                {details.map((item) => (
                    <Row key={item.productId} className="align-items-center border-bottom py-3">
                        <Col md={6}>
                            <div className="d-flex align-items-center">
                                <img 
                                    src={item.imgPath || '/no-img.jpg'} 
                                    alt={item.name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    className="rounded me-3"
                                />
                                <div className="mx-auto">
                                    <h6 className="mb-1">{item.name}</h6>
                                    <small className="text-muted">${item.price}</small>
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-center">
                                <span>Quantity: {item.quantity}</span>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="text-end">
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </Col>
                    </Row>
                ))}
                <Row className="mt-3">
                    <Col className="text-end">
                        <h5>Total: ${totalPrice.toFixed(2)}</h5>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}