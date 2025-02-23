const express = require('express');
const { createName, getNames, deleteAllNames } = require('../controllers/nameController');

const router = express.Router();

// Define the routes
router.post('/names', createName);
router.get('/names', getNames);
router.delete('/names', deleteAllNames);

module.exports = router; 