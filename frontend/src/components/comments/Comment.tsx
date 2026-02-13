import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

interface CommentProps {
    id: number;
    body: string;
    userId: number;
    userFirstName?: string;
    userLastName?: string;
    productId: number;
    createdAt: string;
    deleteComment: (commentId: number) => void;
    currentUser: any;
}

export default function Comment({
    id, 
    createdAt, 
    userFirstName, 
    userLastName, 
    body, 
    userId, 
    deleteComment, 
    currentUser
}: CommentProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const getInitials = () => {
        if (!userFirstName || !userLastName) {
            // If names are missing, try to get them from currentUser if it's the same user
            if (currentUser && currentUser.id === userId) {
                const firstName = currentUser.firstName || userFirstName;
                const lastName = currentUser.lastName || userLastName;
                const firstInitial = firstName?.charAt(0)?.toUpperCase() || '?';
                const lastInitial = lastName?.charAt(0)?.toUpperCase() || '?';
                return firstInitial + lastInitial;
            }
        }
        const firstInitial = userFirstName?.charAt(0)?.toUpperCase() || '?';
        const lastInitial = userLastName?.charAt(0)?.toUpperCase() || '?';
        return firstInitial + lastInitial;
    };

    const getFullName = () => {
        if (!userFirstName || !userLastName) {
            // If names are missing, try to get them from currentUser if it's the same user
            if (currentUser && currentUser.id === userId) {
                const firstName = currentUser.firstName || userFirstName;
                const lastName = currentUser.lastName || userLastName;
                if (firstName && lastName) {
                    return `${firstName} ${lastName}`;
                }
            }
        }
        const firstName = userFirstName || 'Unknown';
        const lastName = userLastName || 'User';
        return `${firstName} ${lastName}`;
    };

    const canDelete = currentUser && (currentUser.id === userId || currentUser.role === 'admin');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async () => {
        if (!canDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteComment(id);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="mb-3 border-0 border-bottom">
            <Card.Body className="px-0">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                            <span className="fw-bold">
                                {getInitials()}
                            </span>
                        </div>
                        <div>
                            <h6 className="mb-0 fw-semibold text-start">
                                {getFullName()}
                            </h6>
                            <small className="text-muted">
                                {formatDate(createdAt)}
                            </small>
                        </div>
                    </div>
                    
                    {canDelete && (
                        <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                
                <div className="ms-5">
                    <p className="mb-0 mt-1 text-start" style={{ lineHeight: '1.5' }}>
                        {body}
                    </p>
                </div>
            </Card.Body>
        </Card>
    );
}