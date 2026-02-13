import { Card } from 'react-bootstrap';
import type { SyntheticEvent } from 'react';

interface ItemProps {
    name: string;
    description: string;
    imgPath: string;
    price: number;
    onClick?: () => void;
}
export default function Item({name, description, imgPath, price, onClick}: ItemProps){
    return (
        <Card 
            className="h-100 shadow-sm" 
            style={{cursor: onClick ? 'pointer' : 'default'}}
            onClick={onClick}
        >
            <Card.Img 
                variant="top"
                src={imgPath} 
                style={{ height: '250px', objectFit: 'cover' }}
                onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src="/no-img.jpg"}
            />
            <Card.Body className="d-flex flex-column">
                <span className="fw-bold fs-5">${price}</span>
                <span className="text-truncate fs-5">{name}</span>
                <span className="small text-muted">{description}</span>
            </Card.Body>
        </Card>
    );
}