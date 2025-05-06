package com.Ignis.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Ignis.user.domain.User;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserLoginId(String userLoginId);
    List<User> findByName(String name);
    boolean existsByUserLoginId(String userLoginId);
}

