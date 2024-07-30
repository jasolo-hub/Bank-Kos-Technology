const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model

const app = express();
const port = 3124;

// Function to add default users if the collection is empty
const addDefaultUsers = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultUsers = [
                { name: 'John Doe', email: 'john.doe@example.com', age: 30 },
                { name: 'Jane Smith', email: 'jane.smith@example.com', age: 25 },
                { name: 'Alice Johnson', email: 'alice.johnson@example.com', age: 28 }
            ];
            await User.insertMany(defaultUsers);
            console.log('Default users added successfully');
        }
    } catch (error) {
        console.error('Error adding default users:', error);
    }
};
// Connect to MongoDB
const mongoURI = 'mongodb+srv://yansolovjov:2HevsorXRWzwkoCm@cluster0.vmbhibr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB connected');
        await addDefaultUsers();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Middleware
app.use(express.json());

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
