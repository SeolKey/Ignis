package com.Ignis.user.bo;

import com.Ignis.common.util.SecurityUtil;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class UserBO {

    private final UserRepository userRepository;

    private final JavaMailSender mailSender;

    private final Map<String, VerificationInfo> verificationMap = new HashMap<>(); // 메모리 기반 저장소

    public void signUp(UserEntity user) {
        user.assignDefaultRole();
        user.setPassword(SecurityUtil.sha256(user.getPassword()));
        userRepository.save(user);
    }

    public boolean login(String loginId, String password, HttpSession session) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if (user != null && user.isCorrectPassword(password)) {
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("loginId", user.getUserLoginId());
            session.setAttribute("userName", user.getName());
            return true;
        }
        return false;
    }

    public boolean isAvailableLoginId(String loginId) {
        return !userRepository.existsByUserLoginId(loginId);
    }

    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user != null && user.isCorrectPassword(currentPassword)) {
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public boolean updateEmail(Long userId, String newEmail) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setEmail(newEmail);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public UserEntity getUserByLoginIdAndPassword(String loginId, String password) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if (user != null && user.isCorrectPassword(password)) {
            return user;
        }
        return null;
    }

    public void generateAndSendVerificationCode(String email) {
        String code = String.valueOf(new Random().nextInt(900000) + 100000);
        verificationMap.put(email, new VerificationInfo(code, LocalDateTime.now()));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("이그니스 - 이메일 인증 코드");
        message.setText("인증코드: " + code + "\n\n3분 내에 입력해주세요.");
        message.setFrom("이그니스 <rjdgh456@naver.com>");
        mailSender.send(message);
        
        UserEntity user = userRepository.findByEmail(email);
        if (user != null) {
            user.setEmailSent(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    public boolean verifyCode(String email, String inputCode) {
        VerificationInfo info = verificationMap.get(email);
        if (info == null || isExpired(info.getGeneratedTime())) {
            verificationMap.remove(email);
            return false;
        }
        return info.getCode().equals(inputCode);
    }

    public boolean markEmailAsVerified(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user != null) {
            user.setEmailVerified(true);
            userRepository.save(user);
            verificationMap.remove(email);
            return true;
        }
        return false;
    }

    private boolean isExpired(LocalDateTime time) {
        return time.plusMinutes(3).isBefore(LocalDateTime.now());
    }

    private static class VerificationInfo {
        private final String code;
        private final LocalDateTime generatedTime;

        public VerificationInfo(String code, LocalDateTime generatedTime) {
            this.code = code;
            this.generatedTime = generatedTime;
        }

        public String getCode() {
            return code;
        }

        public LocalDateTime getGeneratedTime() {
            return generatedTime;
        }
    }
}
