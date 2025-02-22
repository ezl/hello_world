const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new name
const createName = async (req, res) => {
    const { name } = req.body;
    try {
        const newName = await prisma.name.create({
            data: { name },
        });
        res.status(201).json(newName);
    } catch (error) {
        res.status(500).json({ message: 'Error creating name', error });
    }
};

// Get all names
const getNames = async (req, res) => {
    try {
        const names = await prisma.name.findMany();
        res.status(200).json(names);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving names', error });
    }
};

module.exports = { createName, getNames };