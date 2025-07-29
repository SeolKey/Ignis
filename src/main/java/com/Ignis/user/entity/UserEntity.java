package com.Ignis.user.entity;

import java.time.LocalDateTime;

import com.Ignis.common.util.SecurityUtil;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String userLoginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean emailVerified = false; // ✅ 이메일 인증 여부

    @Column(name = "email_sent")
    private LocalDateTime emailSent; // ✅ 메일 보낸 시간

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 도메인 로직
    public void assignDefaultRole() {
        if (this.role == null) {
            this.role = "USER";
        }
    }

    public boolean isCorrectPassword(String rawPassword) {
        String hashedInput = SecurityUtil.sha256(rawPassword);
        return this.password.equals(hashedInput);
    }
}
