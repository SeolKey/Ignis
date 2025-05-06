package com.Ignis.user.bo;

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
        user.assignDefaultRole(); // 도메인 로직 호출
        userRepository.save(user);
    }

    public boolean login(String loginId, String password, HttpSession session) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if (user != null && user.isCorrectPassword(password)) {
            session.setAttribute("user", user.getName());
            return true;
        }
        return false;
    }

    public boolean isAvailableLoginId(String loginId) {
        return !userRepository.existsByUserLoginId(loginId);
    }
}

