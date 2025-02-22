const express = require('express');
const cors = require('cors');
const nameRoutes = require('./routes/nameRoutes');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', nameRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle Prisma client disconnection on exit
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});