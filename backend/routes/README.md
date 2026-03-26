# Routes Folder

This folder contains all route definitions for the backend API.
Each file is responsible for registering endpoints related to a specific resource or feature.

Purpose
-------
The routes layer:
- Defines API endpoints
- Maps HTTP methods to controller functions
- Applies middleware (authentication, validation, etc.)
- Keeps routing logic separated from business logic

Structure
---------
routes/
  auth.routes.js
  users.routes.js
  products.routes.js
  index.js

Guidelines
----------
- One resource per file (e.g., users.routes.js)
- Do not include business logic in routes
- Use controllers for handling request logic
- Apply middleware at route level when needed
- Keep routes RESTful and consistent

Example
-------
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);

module.exports = router;

Naming Convention
-----------------
- <resource>.routes.js
- Use plural resource names (users, orders, products)
- Use lowercase and dots for separation

Best Practices
--------------
- Keep routes thin
- Validate input before controller
- Use proper HTTP status codes
- Group protected routes with auth middleware

Responsibilities
----------------
Routes should:
- Define endpoints
- Attach middleware
- Call controllers

Routes should NOT:
- Access database directly
- Contain business logic
- Handle complex validation
