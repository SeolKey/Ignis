package com.Ignis.user.entity;

import java.time.LocalDateTime;

import com.Ignis.common.util.SecurityUtil;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(name = "email_sent")
    private LocalDateTime emailSent;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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
