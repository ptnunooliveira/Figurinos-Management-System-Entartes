# Controllers Folder

This folder contains all controller functions for the backend API.
Controllers handle request and response logic and coordinate between
routes, services, and data access layers.

Purpose
-------
The controllers layer:
- Receives requests from routes
- Validates and parses request data (basic level)
- Calls services or models
- Sends responses to the client
- Handles HTTP status codes and errors

Structure
---------
controllers/
  auth.controller.js
  users.controller.js
  products.controller.js

Guidelines
----------
- One controller per resource (e.g., users.controller.js)
- Keep controllers focused on request/response handling
- Move business logic to services when it grows
- Use async/await for asynchronous operations
- Always handle errors properly

Example
-------
const usersService = require('../services/users.service');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await usersService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

Naming Convention
-----------------
- <resource>.controller.js
- Use plural resource names
- Use lowercase and dots for separation

Best Practices
--------------
- Keep controllers thin
- Do not access database directly (use services/models)
- Use consistent response format
- Handle errors with try/catch
- Return appropriate HTTP status codes

Responsibilities
----------------
Controllers should:
- Handle request and response
- Call services or models
- Manage status codes
- Handle errors

Controllers should NOT:
- Contain heavy business logic
- Define routes
- Access database directly (if using services layer)
- Perform complex validation