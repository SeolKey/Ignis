package com.Ignis.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Ignis.user.entity.UserEntity;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByUserLoginId(String userLoginId);

    List<UserEntity> findByName(String name);

    boolean existsByUserLoginId(String userLoginId);

    UserEntity findByUserLoginIdAndPassword(String userLoginId, String password);

    UserEntity findByEmail(String email); // ✅ 이메일로 유저 찾기 추가
}
