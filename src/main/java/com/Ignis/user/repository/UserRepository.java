package com.Ignis.user.repository;

import com.Ignis.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

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

    // 📌 전화번호 조회
    @Query("SELECT u.phoneNumber FROM UserEntity u WHERE u.userId = :userId")
    String findPhoneNumberByUserId(@Param("userId") Long userId);

    // 📌 전화번호 업데이트
    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.phoneNumber = :phone WHERE u.userId = :userId")
    void updatePhoneNumberByUserId(@Param("userId") Long userId, @Param("phone") String phone);
}
