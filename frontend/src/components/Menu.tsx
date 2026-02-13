import {useState, useEffect} from 'react';
import {Card, Nav} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

interface MenuItem {
    label: string;
    path: string;
}

export default function Menu(){
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        let items : MenuItem[] | undefined;
        if (user){
            items = [
                { label: 'Home', path: '/' },
                { label: 'Cart', path: '/cart' },
                { label: 'Orders', path: '/orders' },
                { label: 'Logout', path: '/logout' }
            ];
        } else {
            items = [
                { label: 'Home', path: '/' },
                { label: 'Cart', path: '/cart' },
                { label: 'Orders', path: '/orders' },
                { label: 'Log In', path: '/login' }
            ];
        }
        async function setMenu() {setMenuItems(items as MenuItem[]);}
        setMenu();
    }, [user]);

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    return(
        <Card className="mb-2 p-1 w-100">
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