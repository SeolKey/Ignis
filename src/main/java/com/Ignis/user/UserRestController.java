package com.Ignis.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.Ignis.user.bo.UserBO;
import com.Ignis.user.entity.UserEntity;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserRestController {

    private final UserBO userBO;

    @PostMapping("/do-login")
    public Map<String, Object> login(@RequestParam("userLoginId") String userLoginId,
                                     @RequestParam("password") String password,
                                     HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        UserEntity user = userBO.getUserByLoginIdAndPassword(userLoginId, password);
        if (user != null) {
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("userName", user.getName());

            result.put("result", "성공");
            result.put("userId", user.getUserId());
            result.put("username", user.getName());
        } else {
            result.put("code", 403);
            result.put("error_message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }

        return result;
    }

    @PostMapping("/do-sign-up")
    public Map<String, Object> signUp(@RequestBody UserEntity user) {
        Map<String, Object> result = new HashMap<>();

        if (!userBO.isAvailableLoginId(user.getUserLoginId())) {
            result.put("code", 409);
            result.put("error_message", "이미 사용 중인 아이디입니다.");
            return result;
        }

        userBO.signUp(user);
        result.put("result", "회원가입 성공");
        return result;
    }

    @PostMapping("/email-auth/send")
    public Map<String, Object> sendEmailCode(@RequestParam("email") String email) {
        Map<String, Object> result = new HashMap<>();
        userBO.generateAndSendVerificationCode(email);
        result.put("result", "인증코드 발송 완료");
        return result;
    }

    @PostMapping("/email-auth/verify")
    public Map<String, Object> verifyEmailCode(@RequestParam("email") String email,
                                               @RequestParam("code") String code) {
        Map<String, Object> result = new HashMap<>();
        boolean isCorrect = userBO.verifyCode(email, code);

        if (isCorrect) {
            userBO.markEmailAsVerified(email);
            result.put("result", "인증 성공");
        } else {
            result.put("code", 400);
            result.put("error_message", "인증코드가 올바르지 않거나 만료되었습니다.");
        }
        return result;
    }

    // ✅ 아이디 중복확인
    @GetMapping("/check-login-id")
    public Map<String, Object> checkLoginId(@RequestParam("loginId") String loginId) {
        Map<String, Object> res = new HashMap<>();
        if (loginId == null || !loginId.matches("^[a-zA-Z0-9]{5,20}$")) {
            res.put("available", false);
            res.put("message", "아이디는 영문/숫자 5~20자여야 합니다.");
            return res;
        }
        boolean available = userBO.isAvailableLoginId(loginId);
        res.put("available", available);
        if (!available) res.put("message", "이미 사용 중인 아이디입니다.");
        return res;
    }

    // ✅ 이메일 중복확인
    @GetMapping("/check-email")
    public Map<String, Object> checkEmail(@RequestParam("email") String email) {
        Map<String, Object> res = new HashMap<>();
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            res.put("exists", false);
            res.put("message", "이메일 형식을 확인해주세요.");
            return res;
        }
        boolean exists = userBO.isEmailExists(email);
        res.put("exists", exists);
        if (exists) res.put("message", "이 이메일은 이미 가입되어 있습니다.");
        return res;
    }

    // ✅ 현재 로그인 사용자의 전화번호 조회
    @GetMapping("/me/phone")
    public Map<String, Object> getPhone(HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            res.put("status", "unauthorized");
            return res;
        }

        String phone = userBO.getPhoneNumber(userId);
        res.put("phone", phone);
        return res;
    }

    // ✅ 현재 로그인 사용자의 전화번호 업데이트
    @PutMapping("/me/phone")
    public Map<String, Object> updatePhone(@RequestBody Map<String, String> body,
                                           HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            res.put("status", "unauthorized");
            return res;
        }

        try {
            String phone = body.get("phone");
            userBO.updatePhoneNumber(userId, phone);
            res.put("result", "success");
        } catch (Exception e) {
            res.put("result", "fail");
            res.put("error_message", e.getMessage());
        }
        return res;
    }
}
