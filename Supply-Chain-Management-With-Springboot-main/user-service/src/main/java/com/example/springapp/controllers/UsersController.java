package com.example.springapp.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.springapp.models.PasswordUpdate;
import com.example.springapp.models.Users;
import com.example.springapp.service.UsersService;

@RestController
public class UsersController {

    @Autowired
    UsersService usersService;

    @PostMapping("/addUsers")
    public String addUsers(@RequestBody Users user) {
        return usersService.saveUser(user);
    }

    @DeleteMapping("/deleteUsers/{id}")
    public String deleteUsers(@PathVariable String id) {
        return usersService.deleteUser(id);
    }

    @GetMapping("/getType/{id}")
    public String getType(@PathVariable String id) {
        return usersService.getType(id);
    }

    @PutMapping("/updatePassword/{id}")
    public String updatePassword(@PathVariable String id, @RequestBody PasswordUpdate pw) {
        pw.setId(id);
        return usersService.updatePassword(pw);
    }

    @GetMapping("/getAllUsers/{pageNumber}/{pageSize}")
    public List<Users> getAllUsers(@PathVariable int pageNumber, @PathVariable int pageSize) {
        return usersService.getAllUsers(pageNumber, pageSize);
    }

    @GetMapping("getUsersByType/{type}/{pageNumber}/{pageSize}")
    public List<Users> getUsersByType(@PathVariable String type, @PathVariable int pageNumber,
            @PathVariable int pageSize) {
        return usersService.getOrderByStatus(type, pageNumber, pageSize);
    }

    @GetMapping("getUserById/{id}")
    public Users getUserById(@PathVariable String id) {
        return usersService.getUserById(id);
    }
}
