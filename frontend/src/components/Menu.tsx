import {useState, useEffect} from 'react';
import {Card, Nav} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

interface MenuItem {
    label: string;
    path: string;
}

export default function Menu(){
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const items: MenuItem[] = [
            { label: 'Home', path: '/' },
            { label: 'Cart', path: '/cart' },
            { label: 'Orders', path: '/Orders' },
            { label: 'Logout', path: '/logout' }
        ];
        async function setMenu() {setMenuItems(items);}
        setMenu();
    }, []);

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    return(
        <Card>
            <Card.Body className="d-flex flex-row">
                {menuItems.length > 0 ? (
                    <Nav className="w-100 justify-content-center">
                        {menuItems.map((item, index) => (
                            <Nav.Link 
                                key={index}
                                onClick={() => handleMenuClick(item.path)}
                                style={{ cursor: 'pointer' }}
                            >
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>
                ) : (
                    <div className="text-center w-100">Loading menu...</div>
                )}
            </Card.Body>
        </Card>
    );
}