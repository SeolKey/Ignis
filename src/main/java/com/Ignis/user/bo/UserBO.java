package com.Ignis.user.bo;

import com.Ignis.common.util.SecurityUtil;
import org.springframework.stereotype.Component;

import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserBO {

    private final UserRepository userRepository;

    public void signUp(UserEntity user) {
        user.assignDefaultRole();// 도메인 로직 호출
        user.setPassword(SecurityUtil.sha256(user.getPassword()));
        userRepository.save(user);
    }

    public boolean login(String loginId, String password, HttpSession session) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if (user != null && user.isCorrectPassword(password)) {
            session.setAttribute("userId", user.getUserId());           // 🔹 사용자 식별용
            session.setAttribute("loginId", user.getUserLoginId());     // 🔹 로그인 ID
            session.setAttribute("userName", user.getName());           // 🔹 유저 이름 (원래 있던 내용 개선)
            return true;
        }
        return false;
    }

    public boolean isAvailableLoginId(String loginId) {
        return !userRepository.existsByUserLoginId(loginId);
    }

    public boolean updatePassword(Long userId, String currentPassword, String newPassword){
        UserEntity user = userRepository.findById(userId).orElse(null);
        if(user != null && user.isCorrectPassword(currentPassword)){
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean updateEmail(Long userId, String newEmail){
        UserEntity user = userRepository.findById(userId).orElse(null);
        if(user != null){
            user.setEmail(newEmail);
            userRepository.save(user);
            return true;
        }
        return false;
    }
    
    public UserEntity getUserByLoginIdAndPassword(String loginId, String password) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if(user != null && user.isCorrectPassword(password)){
            return user;
        }
        return null;
    }
}

