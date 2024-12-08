# Ride Backend API Documentation

## Overview

This is the backend API for the Ride application. It provides endpoints for user registration and authentication. The API is built using Node.js, Express, and MongoDB.

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- Endpoints
  - [User Registration](#user-registration)
- Models
  - [User Model](#user-model)
- Services
  - [User Service](#user-service)
- Controllers
  - [User Controller](#user-controller)

## Getting Started

To get started with the Ride Backend API, follow these steps:

1. Clone the repository:

2. cd ride-backend

3. npm install


Project Structure

.env
app.js
controllers/
  user.controller.js
db/
  db.js
models/
  user.model.js
package.json
routes/
  user.routes.js
server.js
services/
  user.service.js

Endpoints
User Registration
URL: /user/register
Method: POST
Description: Registers a new user.
Request Body:
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}

Response:
Success (Status Code: 201):

{
  "token": "jwt_token",
  "user": {
    "_id": "user_id",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}

Error (Status Code: 400):
{
  "errors": [
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    ...
  ]
}

Models
User Model
The User model is defined in user.model.js. It includes the following fields:

fullname: An object containing firstname and lastname.
email: The user's email address.
password: The user's hashed password.
The model also includes the following methods:

generateAuthToken(): Generates a JWT for the user.
comparePassword(password): Compares a given password with the user's hashed password.
hashPassword(password): Hashes a given password.
Services
User Service
The UserService is defined in user.service.js. It includes the following function:

createUser({ firstname, lastname, email, password }): Creates a new user with the given details. Throws an error if any required fields are missing.
Controllers
User Controller
The UserController is defined in user.controller.js. It includes the following function:

registerUser(req, res): Handles user registration. Validates the request body, hashes the password, creates a new user, generates a JWT, and returns the user and token.
Flow of User Registration
Client Request: The client sends a POST request to the /user/register endpoint with the user's details in the request body.
Validation: The request body is validated using express-validator to ensure all required fields are present and meet the specified criteria.
Controller: The registerUser function in user.controller.js handles the request. It checks for validation errors and hashes the user's password.
Service: The createUser function in user.service.js is called to create a new user in the database.
Model: The User model in user.model.js defines the schema and methods for the user. The password is hashed before saving.
JWT Token: A JWT token is generated for the user using the generateAuthToken method in the User model.
Response: The server responds with a status code of 201 and a JSON object containing the JWT token and user details if the registration is successful. If there are validation errors, a status code of 400 is returned with the error details.
License
This project is licensed under the MIT License.


