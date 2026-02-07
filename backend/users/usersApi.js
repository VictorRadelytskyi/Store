import { Router } from 'express';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import Users from './users.js';
const router = Router();

const saltRounds = process.env.saltRounds || 12;

router.get('/', async (req, res) => {
    // TODO: implement authorization
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

router.post('/create', async (req, res) => {
    try{
        const { email, password, firstName, lastName, role } = req.body;
        
        if (!email || !password || !firstName || !lastName ){
            return res.status(400).json({
                error: "Email, password, first name and last name should be submitted"
            });
        }

        // Validate role if provided
        const validRoles = ['user', 'admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Role must be either 'user' or 'admin'"
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
                error: 'password length should be at lest 12 characters long'
            });
        }

        const existingUser = await Users.findOne({where: {email}});
        if (existingUser){
            return res.status(400).json({
                error: "the user already exists"
            });
        }

        const passHash = await bcrypt.hash(password, saltRounds);
        
        const user = await Users.create({
            email: email.toLowerCase().trim(),
            firstName: firstName.trim(), 
            lastName: lastName.trim(),
            passHash,
            role: role || 'user'  // Default to 'user' if not specified
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

router.put('/update/:id', async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                error: `No user with id: ${req.params.id} found`
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
            
            updateData.passHash = await bcrypt.hash(password, saltRounds);
        }
        
        if (firstName) {
            updateData.firstName = firstName.trim();
        }
        
        if (lastName) {
            updateData.lastName = lastName.trim();
        }
        
        if (role) {
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

router.delete('/delete/:id', async (req, res) => {
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

export default router;