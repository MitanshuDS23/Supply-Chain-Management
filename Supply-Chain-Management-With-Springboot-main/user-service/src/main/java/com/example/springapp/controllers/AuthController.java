package com.example.springapp.controllers;

import com.example.springapp.models.Users;
import com.example.springapp.service.UsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
@Validated
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UsersService usersService;

    // @Autowired
    // private com.example.springapp.service.SupplierService supplierService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Users user) {
        try {
            // Input validation
            if (user == null) {
                logger.warn("Signup attempt with null user data");
                return buildErrorResponse("User data is required", HttpStatus.BAD_REQUEST);
            }

            if (user.getId() == null || user.getId().trim().isEmpty()) {
                logger.warn("Signup attempt without username");
                return buildErrorResponse("Username is required", HttpStatus.BAD_REQUEST);
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                logger.warn("Signup attempt without email for user: {}", user.getId());
                return buildErrorResponse("Email is required", HttpStatus.BAD_REQUEST);
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                logger.warn("Signup attempt without password for user: {}", user.getId());
                return buildErrorResponse("Password is required", HttpStatus.BAD_REQUEST);
            }

            if (user.getPassword().length() < 6) {
                logger.warn("Signup attempt with weak password for user: {}", user.getId());
                return buildErrorResponse("Password must be at least 6 characters", HttpStatus.BAD_REQUEST);
            }

            // Email format validation (basic)
            if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                logger.warn("Signup attempt with invalid email format: {}", user.getEmail());
                return buildErrorResponse("Invalid email format", HttpStatus.BAD_REQUEST);
            }

            // Check if user with email already exists
            Users existingUserByEmail = usersService.getUserByEmail(user.getEmail());
            if (existingUserByEmail != null) {
                logger.warn("Signup attempt with existing email: {}", user.getEmail());
                return buildErrorResponse("Email already registered", HttpStatus.BAD_REQUEST);
            }

            // Check if username already exists
            Users existingUserById = usersService.getUserById(user.getId());
            if (existingUserById != null && !existingUserById.getId().equals("-1")) {
                logger.warn("Signup attempt with existing username: {}", user.getId());
                return buildErrorResponse("Username already taken", HttpStatus.BAD_REQUEST);
            }

            // Create user
            String result = usersService.saveUser(user);
            logger.info("Successfully created user account: {}", user.getId());

            // Remove password from response
            user.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            response.put("user", user);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            logger.error("Error during signup for user: {}", user != null ? user.getId() : "null", e);
            return buildErrorResponse(
                    "An error occurred while creating your account. Please try again later.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String emailOrUsername = null;
        try {
            // Input validation
            if (credentials == null || credentials.isEmpty()) {
                logger.warn("Login attempt with no credentials");
                return buildErrorResponse("Email and password are required", HttpStatus.BAD_REQUEST);
            }

            emailOrUsername = credentials.get("email");
            String password = credentials.get("password");

            if (emailOrUsername == null || emailOrUsername.trim().isEmpty()) {
                logger.warn("Login attempt without email/username");
                return buildErrorResponse("Email or username is required", HttpStatus.BAD_REQUEST);
            }

            if (password == null || password.trim().isEmpty()) {
                logger.warn("Login attempt without password for user: {}", emailOrUsername);
                return buildErrorResponse("Password is required", HttpStatus.BAD_REQUEST);
            }

            // Authenticate user
            Users user = usersService.authenticateUser(emailOrUsername.trim(), password);

            if (user != null) {
                logger.info("Successful login for user: {}", user.getId());

                // Remove password from response
                user.setPassword(null);

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", user);

                return ResponseEntity.ok(response);
            } else {
                logger.warn("Failed login attempt for user: {}", emailOrUsername);
                return buildErrorResponse("Invalid email/username or password", HttpStatus.UNAUTHORIZED);
            }

        } catch (Exception e) {
            logger.error("Error during login for user: {}", emailOrUsername, e);
            return buildErrorResponse(
                    "An error occurred during login. Please try again later.",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logout successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during logout", e);
            return buildErrorResponse(
                    "An error occurred during logout",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method to build consistent error responses
     */
    private ResponseEntity<?> buildErrorResponse(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}
