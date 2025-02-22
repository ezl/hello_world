const express = require('express');
const { createName, getNames } = require('../controllers/nameController');

const router = express.Router();

// Define the routes
router.post('/names', createName);
router.get('/names', getNames);

module.exports = router; 