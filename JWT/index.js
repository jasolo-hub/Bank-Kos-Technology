const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3124;

// MongoDB connection URI
const mongoURI = 'mongodb+srv://yansolovjov:2HevsorXRWzwkoCm@cluster0.vmbhibr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(express.json());

// JWT Secret Key
const JWT_SECRET = 'eW91cl9zdXBlcl9rZXk='; // Replace with a strong secret key

// Register route
app.post('/register', async (req, res) => {
    const { name, email, password, age } = req.body;
    try {
        const user = new User({ name, email, password, age });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Protected route
app.get('/protected', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Protected content', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect to MongoDB and start server
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
