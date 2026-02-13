import { Row, Col, Button } from 'react-bootstrap';

interface CartItemData {
    productId: number;
    quantity: number;
    name: string;
    price: number;
    imgPath?: string;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
}

export default function CartItem({productId, imgPath, name, price, quantity, updateQuantity, removeItem}: CartItemData){
    return(
        <Row key={productId} className="align-items-center border-bottom py-3">
            <Col md={6}>
                <div className="d-flex align-items-center">
                    <img 
                        src={imgPath || '/no-img.jpg'} 
                        alt={name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded me-3"
                    />
                    <div className="mx-auto">
                        <h6 className="mb-1">{name}</h6>
                        <small className="text-muted">${price}</small>
                    </div>
                </div>
            </Col>
            <Col md={3}>
                <div className="d-flex align-items-center">
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(productId, quantity - 1)}
                    >
                        -
                    </Button>
                    <span className="mx-3">{quantity}</span>
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => updateQuantity(productId, quantity + 1)}
                    >
                        +
                    </Button>
                </div>
            </Col>
            <Col md={2}>
                <strong>${(price * quantity).toFixed(2)}</strong>
            </Col>
            <Col md={1}>
                <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeItem(productId)}
                >
                    ×
                </Button>
            </Col>
        </Row>
    );
}