const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppDataSource = require('../data-source');
const User = require("../models/User");
const ApiError = require('../utils/apiError');
const ApiSuccess = require('../utils/apiSuccess');
const { userCreateSchema } = require('../validation/modelValidations'); 

const register = async (req, res, next) => {
    try {
        // Validate input
        const { error, value } = userCreateSchema.validate(req.body);
        if (error) {
            return next(new ApiError(400, error.details[0].message));
        }

        const { name, email, password, role } = value;

        console.log('Registration request received:', { name, email, role });

        const userRepository = AppDataSource.getRepository(User);

        // Check if the user already exists
        console.log('Checking if user exists...');
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', existingUser);
            return next(new ApiError(400, 'User already exists'));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        console.log('Creating user...');
        const user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        // Save the user to the database
        await userRepository.save(user);
        console.log('User saved successfully:', user);

        // res.status(201).json({ message: 'User registered successfully' });
        (new ApiSuccess(201, 'User registered successfully',null, null, null)).send(res);
    } catch (err) {
        console.error('Registration error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    console.log('Login request received:', { email });

    try {
        const userRepository = AppDataSource.getRepository(User);

        // Find the user by email
        console.log('Finding user by email...');
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return next(new ApiError(400, 'Invalid credentials'));
        }

        // Compare passwords
        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Passwords do not match');
            return next(new ApiError(400, 'Invalid credentials'));
        }

        // Generate a JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful');
        // res.status(200).json({ token });
        (new ApiSuccess(201, 'User loged in successfully',token, null, null)).send(res);
    } catch (err) {
        console.error('Login error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

// Get all courses
const getAllUsers = async (req, res, next) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        // res.status(200).json(users);
        (new ApiSuccess(201, 'Users received successfully',users, null, null)).send(res);
    } catch (err) {
        console.error('Get all users error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

const getUserById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id } }); // Use findOne

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // res.status(200).json(user);
        (new ApiSuccess(201, 'User received successfully',user, null, null)).send(res);
    } catch (err) {
        console.error(err);
        return next(new ApiError(500, 'Server error'));
    }
};

const getUserByEmail = async (req, res, next) => {
    const { email } = req.query; // Get email from query parameters


    if (!email) {
        return next(new ApiError(400, 'Email is required'));
    }

    try {
        const userRepository = AppDataSource.getRepository(User);

        // Find the user by email
        console.log('Finding user by email...');
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return next(new ApiError(400, 'Invalid credentials'));
        }

        // res.status(200).json(user);
        (new ApiSuccess(201, 'User received successfully',user, null, null)).send(res);
    } catch (err) {
        console.error('Login error:', err);
        return next(new ApiError(500, 'Server error'));
    }
};

module.exports = { register, login, getAllUsers, getUserById, getUserByEmail };