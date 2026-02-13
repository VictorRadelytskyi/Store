import { Router } from 'express';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import Users from './users.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import {generateRefreshToken, generateAccessToken} from '../middleware/tokenService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = Router();


const SALT_ROUNDS = parseFloat(process.env.SALT_ROUNDS) || 12;

// admin-only endpoint to get all users
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try{ 
        const users = await Users.findAll({
            attributes: {exclude: ["passHash"]}
        });
        res.status(200).json(users);
    } catch (err) {
        console.error(`Error getting users: ${err}`);
        res.status(500).json({ error: "Error getting users" });
    }
});

// endpoint to create a user
router.post('/register', async (req, res) => {
    try{
        const { email, password, firstName, lastName } = req.body;
        
        if (!email || !password || !firstName || !lastName ){
            return res.status(400).json({
                error: "Email, password, first name and last name should be submitted"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format"
            });
        }

        if (password.length < 12) {
            return res.status(400).json({
                error: 'Password length should be at least 12 characters long'
            });
        }

        // Validate firstName and lastName contain only alphanumeric characters
        const alphanumericRegex = /^[a-zA-Z]+$/;
        if (!alphanumericRegex.test(firstName.trim())) {
            return res.status(400).json({
                error: 'First name should contain only alphanumeric characters'
            });
        }

        if (!alphanumericRegex.test(lastName.trim())) {
            return res.status(400).json({
                error: 'Last name should contain only alphanumeric characters'
            });
        }

        const existingUser = await Users.findOne({where: {email}});
        if (existingUser){
            return res.status(400).json({
                error: "the user already exists"
            });
        }

        const passHash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const user = await Users.create({
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(), 
            lastName: lastName.trim(),
            passHash,
        });

        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({
            message: "User created successfully",
            user: userResponse
        });

    } catch(err){
        console.error(`Error creating user of id ${req.body.id}: ${err}`);

        if (err.name === "SequelizeValidationError"){
            const validationErrors = err.errors.map(err => err.message);
            return res.status(400).json({
                error: "Validation failed",
                details: validationErrors
            });
        }

        if (err.name === "SequelizeUniqueConstraintError"){
            return res.status(409).json({
                error: "Incorrect email"
            });
        }

        res.status(500).json({error: "Internal server error"});
    }
});

// endpoint (protected from privelege-escalation!) to update user data
router.put('/update/:id', authenticate, async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);

        if (!user) {
            // return 403 in case it's not admin to prevent user enumeration
            if (req.user.role !== 'admin'){
                return res.status(403).json({
                    error: "Access denied. You can only update your own data unless you have admin role"
                });
            } else{
                return res.status(404).json({
                    error: `No user with id: ${req.params.id} found`
                });
            }
        }

        // check if the user wants to update his own data
        if (user.id !== req.user.id && req.user.role !== 'admin'){
            return res.status(403).json({
                error: "Access denied. You can only update your own data unless you have admin role"
            });
        }

        const { email, password, firstName, lastName, role } = req.body;
        
        const updateData = {};
        
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: "Invalid email format"
                });
            }
            
            const existingUser = await Users.findOne({ 
                where: { email, id: { [Op.ne]: req.params.id } }
            });
            if (existingUser) {
                return res.status(409).json({
                    error: "Email is already taken by another user"
                });
            }
            
            updateData.email = email.toLowerCase().trim();
        }
        
        if (password) {
            if (password.length < 12) {
                return res.status(400).json({
                    error: 'Password length should be at least 12 characters long'
                });
            }
            
            updateData.passHash = await bcrypt.hash(password, SALT_ROUNDS);
        }
        
        if (firstName) {
            updateData.firstName = firstName.trim();
        }
        
        if (lastName) {
            updateData.lastName = lastName.trim();
        }
        
        if (role) {
            // prevent privelege escalation
            if (req.user.role !== 'admin'){
                return res.status(403).json({
                    error: "Access denied. Only admin can change your role to admin"
                });
            }
            const validRoles = ['user', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    error: "Invalid role. Role must be either 'user' or 'admin'"
                });
            }
            updateData.role = role;
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: "No fields provided to update"
            });
        }
        
        await Users.update(updateData, { 
            where: { id: req.params.id }
        });
        
        const updatedUser = await Users.findByPk(req.params.id, {
            attributes: { exclude: ['passHash'] }
        });
        
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
        
    } catch (err) {
        console.error(`Failed to update user of id ${req.params.id}: ${err}`);

        if (err.name === "SequelizeValidationError"){
            const validationDetails = err.errors.map(err => err.message);
            return res.status(400).json({
                error: "Validation failed",
                details: validationDetails
            });
        }

        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                error: "Email is already taken"
            });
        }

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// admin-only endpoint to delete a user
router.delete('/delete/:id', authenticate, authorize(['admin']), async (req, res) => {
    try{
        const deletedCount = await Users.destroy({ where: { id: req.params.id } });
        if (deletedCount === 0) {
            return res.status(404).json({
                error: `User of id ${req.params.id} not found`
            });
        }

        res.status(200).json({
            message: `Deleted user of id ${req.params.id}`
        });

    } catch(err){
        console.error(`Error deleting user of id ${req.params.id}: ${err}`);

        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// login endpoint for users
router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        
        const user = await Users.findOne({
            where: {
                email
            }
        });

        try{
            if (!user){
                return res.status(401).json({
                    error: "Invalid credentials"
                });
            }

            const isMatch = await bcrypt.compare(password, user.passHash);
            if (!isMatch){
                return res.status(401).json({
                    error: "Invalid credentials"
                });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await Users.update({refreshToken}, {
                where: {
                    id: user.id
                }
            });

            res.status(200).json({
                message: "Logged in successfully",
                accessToken,
                refreshToken,
                userId: user.id,
                role: user.role
            });

        }catch(err){
            console.error(`Error whilst logging in: ${err}`);
            return res.status(401).json({
                error: "Login failed"
            });
        }
    } catch(err){
        console.error(`Error whilst logging in: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// endpoint to refresh access token
router.post('/refresh', async (req, res) => {
    try{
        const { token } = req.body;

        if (!token){
            return res.status(401).json({
                error: "Access denied. Valid token parameter is required"
            });
        }

        const user = await Users.findOne({
            where: {
                refreshToken: token
            }
        });

        if (!user){
            return res.status(403).json({
                error: "Access denied. You are only authorized to refresh your own token"
            });
        }

        if (user.refreshToken !== token){
            return res.status(403).json({
                error: "Access denied: failed to refresh access token"
            });
        }

        const accessToken = generateAccessToken(user);

        res.status(200).json({
            message: "Token refreshed successfully",
            accessToken,
            userId: user.id,
            role: user.role
        });

    } catch(err){
        console.error(`Error whilst refreshing access token: ${err}`);
        res.status(403).json({
            error: "Refresh token expired"
        });
    }
});

// logout endpoint that removes refresh token from db
router.post('/logout', authenticate, async (req, res) => {
    try{
        await Users.update({
            refreshToken: null
        },{
            where: {
                id: req.user.id
            }
        });
        res.status(204).send();
    } catch(err){
        console.error(`Error whilst logging out: ${err}`);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

export default router;