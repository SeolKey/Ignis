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

    private final Map<String, VerificationInfo> verificationMap = new HashMap<>();

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

    public boolean isEmailExists(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase()) != null;
    }

    /** ✅ 설정 페이지 입장 전 비밀번호 확인용 */
    public boolean checkPassword(Long userId, String rawPassword) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        return user != null && user.isCorrectPassword(rawPassword);
    }

    /** ✅ 비밀번호 변경: 현재 비밀번호 검증 + 새 비밀번호 해시 저장 */
    public boolean updatePassword(Long userId, String currentPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;
        if (!user.isCorrectPassword(currentPassword)) return false;

        user.setPassword(SecurityUtil.sha256(newPassword)); // ← 해시 저장 (기존 raw 저장 문제 수정)
        userRepository.save(user);
        return true;
    }

    /** ✅ 이메일 변경: 소문자 정규화 + 중복 체크 */
    public boolean updateEmail(Long userId, String newEmail) {
        String normalized = newEmail == null ? null : newEmail.trim().toLowerCase();
        if (normalized == null || normalized.isBlank()) return false;

        // 본인 제외 중복 체크가 필요하면 repository에 별도 쿼리 추가해서 교체
        if (userRepository.existsByEmailIgnoreCase(normalized)) return false;

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        user.setEmail(normalized);
        userRepository.save(user);
        return true;
    }

    public UserEntity getUserByLoginIdAndPassword(String loginId, String password) {
        UserEntity user = userRepository.findByUserLoginId(loginId);
        if (user != null && user.isCorrectPassword(password)) {
            return user;
        }
        return null;
    }

    public UserEntity getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    /** 📌 전화번호 업데이트 */
    public void updatePhoneNumber(Long userId, String phoneNumber) {
        UserEntity user = userRepository.findById(userId).orElseThrow();
        user.setPhoneNumber(phoneNumber);
        userRepository.save(user);
    }

    /** 📌 전화번호 조회 */
    public String getPhoneNumber(Long userId) {
        return userRepository.findPhoneNumberByUserId(userId);
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
        public String getCode() { return code; }
        public LocalDateTime getGeneratedTime() { return generatedTime; }
    }
}
