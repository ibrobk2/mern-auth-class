const express = require('express');
const User = require('./models/user.js');
const connectDB = require('./config/db.js');
require('dotenv').config();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);


connectDB();

port = process.env.PORT || 5000;

app.listen(port, ()=>console.log(`Server is running on port ${port}`))






