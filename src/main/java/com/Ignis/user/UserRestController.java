package com.Ignis.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            result.put("username", user.getName()); // ✅ 여기가 중요
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
}
