package com.Ignis.user.repository;

import com.Ignis.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByUserLoginId(String userLoginId);

    List<UserEntity> findByName(String name);

    boolean existsByUserLoginId(String userLoginId);

    UserEntity findByUserLoginIdAndPassword(String userLoginId, String password);

    UserEntity findByEmail(String email);

    // 대소문자 무시용
    boolean existsByUserLoginIdIgnoreCase(String userLoginId);
    boolean existsByEmailIgnoreCase(String email);
}
