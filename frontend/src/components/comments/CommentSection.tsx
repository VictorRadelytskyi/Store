import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Alert, Container, Card, Form, Button } from 'react-bootstrap';
import Comment from './Comment.tsx';

interface CommentData {
    id: number;
    body: string;
    userId: number;
    userFirstName?: string;
    userLastName?: string;
    productId: number;
    createdAt: string;
}

export default function CommentSection({productId}: {productId: number}){
    const [comments, setComments] = useState<CommentData[]>([]);
    const [userComment, setUserComment] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { user, token } = useAuth();

    useEffect(() => {
        async function getComments(){
            setError('');
            try{
                const response = await axios.get(`http://localhost:5000/api/comments/${productId}`);
                
                console.log('Comments from API:', response?.data?.comments);
                setComments(response?.data?.comments || []);
    
            }catch (err){
                if (axios.isAxiosError(err)){
                    setError(err.response?.data?.error || 'Error loading comment section');
                } else{
                    setError('Error loading comment section');
                }
            }
        }

        getComments();
    }, [productId]);

    async function postComment(comment: string){
        setError('');
            try{
                const response = await axios.post(`http://localhost:5000/api/comments/${productId}`, {
                    body: comment.trim()
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setComments(prev => [...prev, response?.data?.comment]);
                setUserComment('');
    
            }catch (err){
                if (axios.isAxiosError(err)){
                    setError(err.response?.data?.error || 'Error posting comment');
                } else{
                    setError('Error posting comment');
                }
            }
    }

    async function deleteComment(commentId: number) {
        setError('');
        try {
            await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Error deleting comment');
            } else {
                setError('Error deleting comment');
            }
        }
    }

    return(
        <Container className="mt-4">
            <Card>
                <Card.Header>
                    <h4>Customer Reviews ({comments.length})</h4>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                    
                    {/* Comments List */}
                    {comments.length === 0 ? (
                        <div className="text-center py-3">
                            <p className="text-muted">No comments yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="mb-4">
                            {comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    id={comment.id}
                                    body={comment.body}
                                    userId={comment.userId}
                                    userFirstName={comment?.userFirstName}
                                    userLastName={comment?.userLastName}
                                    productId={comment.productId}
                                    createdAt={comment.createdAt}
                                    deleteComment={deleteComment}
                                    currentUser={user}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Comment Form */}
                    <div className="border-top pt-4">
                        <h5 className="mb-3">Share your thoughts on this product</h5>
                        {user && token ? (
                            <div className="d-flex flex-column gap-3">
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={userComment}
                                    onChange={e => setUserComment(e.target.value)}
                                    placeholder="Write your review..."
                                    maxLength={3000}
                                />
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        {userComment.length}/3000 characters
                                    </small>
                                    <Button 
                                        onClick={() => postComment(userComment)} 
                                        disabled={!userComment.trim() || userComment.trim().length < 3}
                                        variant="primary"
                                    >
                                        Post Review
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Alert variant="info">
                                <Alert.Heading>Want to leave a review?</Alert.Heading>
                                <p>Please log in to share your thoughts about this product.</p>
                            </Alert>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}