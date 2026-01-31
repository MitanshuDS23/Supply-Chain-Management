package com.example.springapp.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.springapp.models.Users;
import com.example.springapp.repositories.UsersRepo;

@Service
public class UsersService {

    private static final Logger logger = LoggerFactory.getLogger(UsersService.class);

    @Autowired
    private UsersRepo usersRepo;

    public String saveUser(Users user) {
        try {
            if (user == null) {
                logger.error("Attempt to save null user");
                throw new IllegalArgumentException("User cannot be null");
            }

            // Validate required fields
            if (user.getId() == null || user.getId().trim().isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }

            usersRepo.save(user);
            logger.info("Successfully saved user: {}", user.getId());
            return "User saved successfully";
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error while saving user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error saving user: {}", user != null ? user.getId() : "null", e);
            throw new RuntimeException("Failed to save user: " + e.getMessage(), e);
        }
    }

    public List<Users> getAllUsers() {
        try {
            List<Users> users = usersRepo.findAll();
            logger.info("Retrieved {} users", users.size());
            return users;
        } catch (Exception e) {
            logger.error("Error retrieving all users", e);
            throw new RuntimeException("Failed to retrieve users: " + e.getMessage(), e);
        }
    }

    public String deleteUser(String id) {
        try {
            if (id == null || id.trim().isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }

            if (!usersRepo.existsById(id)) {
                logger.warn("Attempt to delete non-existent user: {}", id);
                return "User not found";
            }

            usersRepo.deleteById(id);
            logger.info("Successfully deleted user: {}", id);
            return "User deleted successfully";
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error while deleting user: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error deleting user: {}", id, e);
            throw new RuntimeException("Failed to delete user: " + e.getMessage(), e);
        }
    }

    public Users getUserById(String id) {
        try {
            if (id == null || id.trim().isEmpty()) {
                logger.warn("getUserById called with null or empty ID");
                return createNotFoundUser();
            }

            Users user = usersRepo.findById(id).orElse(null);
            
            if (user == null) {
                logger.debug("User not found with ID: {}", id);
                return createNotFoundUser();
            }
            
            return user;
            
        } catch (Exception e) {
            logger.error("Error retrieving user by ID: {}", id, e);
            return createNotFoundUser();
        }
    }

    /**
     * Get user by email address
     */
    public Users getUserByEmail(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                logger.warn("getUserByEmail called with null or empty email");
                return null;
            }

            Users user = usersRepo.findByEmail(email.trim());
            
            if (user != null) {
                logger.debug("Found user by email: {}", email);
            }
            
            return user;
            
        } catch (Exception e) {
            logger.error("Error retrieving user by email: {}", email, e);
            return null;
        }
    }

    /**
     * Authenticate user with email/username and password
     */
    public Users authenticateUser(String emailOrUsername, String password) {
        try {
            // Input validation
            if (emailOrUsername == null || emailOrUsername.trim().isEmpty()) {
                logger.warn("Authentication attempt with null/empty email or username");
                return null;
            }

            if (password == null || password.trim().isEmpty()) {
                logger.warn("Authentication attempt with null/empty password for user: {}", emailOrUsername);
                return null;
            }

            Users user = null;
            String trimmedIdentifier = emailOrUsername.trim();
            
            // Try to find by email first
            user = usersRepo.findByEmail(trimmedIdentifier);
            
            // If not found by email, try by username (id)
            if (user == null) {
                user = usersRepo.findById(trimmedIdentifier).orElse(null);
            }
            
            // User not found
            if (user == null) {
                logger.debug("User not found: {}", trimmedIdentifier);
                return null;
            }

            // Verify password
            if (!password.equals(user.getPassword())) {
                logger.warn("Invalid password attempt for user: {}", user.getId());
                return null;
            }

            // Check if user is active (default to true if null for backwards compatibility)
            Boolean isActive = user.getIsActive();
            if (isActive != null && !isActive) {
                logger.warn("Login attempt for inactive user: {}", user.getId());
                return null;
            }

            logger.debug("Successfully authenticated user: {}", user.getId());
            return user;
            
        } catch (Exception e) {
            logger.error("Error during authentication for user: {}", emailOrUsername, e);
            return null;
        }
    }

    /**
     * Helper method to create a "not found" user object
     */
    private Users createNotFoundUser() {
        Users user = new Users();
        user.setId("-1");
        user.setType("User not found");
        return user;
    }

    /**
     * Get user type by ID
     */
    public String getType(String id) {
        try {
            Users user = getUserById(id);
            return user != null ? user.getType() : "User not found";
        } catch (Exception e) {
            logger.error("Error getting type for user: {}", id, e);
            return "Error";
        }
    }

    /**
     * Update user password
     */
    public String updatePassword(com.example.springapp.models.PasswordUpdate passwordUpdate) {
        try {
            if (passwordUpdate == null || passwordUpdate.getId() == null) {
                logger.warn("updatePassword called with null data");
                throw new IllegalArgumentException("Password update data cannot be null");
            }

            Users user = usersRepo.findById(passwordUpdate.getId()).orElse(null);
            
            if (user == null) {
                logger.warn("Attempt to update password for non-existent user: {}", passwordUpdate.getId());
                return "User not found";
            }

            user.setPassword(passwordUpdate.getNewpassword());
            usersRepo.save(user);
            logger.info("Password updated for user: {}", user.getId());
            return "Password updated successfully";
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error updating password", e);
            throw new RuntimeException("Failed to update password: " + e.getMessage(), e);
        }
    }

    /**
     * Get all users with pagination
     */
    public List<Users> getAllUsers(int pageNumber, int pageSize) {
        try {
            // For now, return all users - pagination can be implemented with Spring Data PageRequest
            List<Users> users = usersRepo.findAll();
            logger.info("Retrieved {} users (page {}, size {})", users.size(), pageNumber, pageSize);
            return users;
        } catch (Exception e) {
            logger.error("Error retrieving users with pagination", e);
            throw new RuntimeException("Failed to retrieve users: " + e.getMessage(), e);
        }
    }

    /**
     * Get users by type/status with pagination
     */
    public List<Users> getOrderByStatus(String type, int pageNumber, int pageSize) {
        try {
            // For now, filter in memory - can be optimized with custom repository query
            List<Users> allUsers = usersRepo.findAll();
            List<Users> filtered = allUsers.stream()
                .filter(user -> user.getType() != null && user.getType().equalsIgnoreCase(type))
                .toList();
            
            logger.info("Retrieved {} users of type '{}' (page {}, size {})", 
                filtered.size(), type, pageNumber, pageSize);
            return filtered;
        } catch (Exception e) {
            logger.error("Error retrieving users by type: {}", type, e);
            throw new RuntimeException("Failed to retrieve users by type: " + e.getMessage(), e);
        }
    }
}
