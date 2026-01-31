package com.example.springapp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.springapp.models.Users;

public interface UsersRepo extends JpaRepository<Users, String> {
    Page<Users> findByType(String type, Pageable pageable);
    Users findByEmail(String email);
}