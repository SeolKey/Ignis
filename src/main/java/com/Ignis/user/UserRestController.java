package com.Ignis.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ignis.user.bo.UserBO;
import com.Ignis.user.domain.User;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserRestController {

    private final UserBO userBO;

    @PostMapping("/do-login")
    public Map<String, Object> login(@RequestParam("userLoginId") String userLoginId,
                                     @RequestParam("password") String password,
                                     HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        boolean success = userBO.login(userLoginId, password, session);
        if (success) {
            result.put("result", "성공");
        } else {
            result.put("code", 403);
            result.put("error_message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }

        return result;
    }

    @PostMapping("/do-sign-up")
    public Map<String, Object> signUp(@RequestBody User user) {
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
}


