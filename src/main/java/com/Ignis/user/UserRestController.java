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

        // 1) 파라미터 유효성 간단 체크 (디버깅에 도움)
        if (userLoginId == null || password == null) {
            result.put("code", 400);
            result.put("error_message", "필수 파라미터가 없습니다.(userLoginId/password)");
            return result;
        }

        UserEntity user = userBO.getUserByLoginIdAndPassword(userLoginId, password);
        if (user != null) {
            // 2) 세션에 표준 키로 저장
            session.setAttribute("userId", user.getUserId());   // Long/Integer 모두 가능 (아래 /me에서 안전 변환)
            session.setAttribute("userLoginId", user.getUserLoginId());
            session.setAttribute("userName", user.getName());

            result.put("result", "성공");
            result.put("userId", user.getUserId());
            result.put("userName", user.getName());
        } else {
            result.put("code", 403);
            result.put("error_message", "아이디 또는 비밀번호가 잘못되었습니다.");
        }
        return result;
    }

    /** ✅ 로그인 상태 확인 / 사용자 정보 복구 API */
    @GetMapping("/me")
    public Map<String, Object> me(HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        Object rawId = session.getAttribute("userId");
        String loginId = (String) session.getAttribute("userLoginId");
        String name = (String) session.getAttribute("userName");

        Long userId = null;
        if (rawId instanceof Number) {
            userId = ((Number) rawId).longValue();
        }

        if (userId == null) {
            res.put("authenticated", false);
            res.put("code", 401);
            res.put("message", "로그인 필요");
            return res;
        }

        res.put("authenticated", true);
        res.put("userId", userId);
        res.put("userLoginId", loginId);
        res.put("userName", name);
        return res;
    }

    // (기존 코드) 이메일 인증/중복확인/전화번호 API는 그대로 유지

    @GetMapping("/me/phone")
    public Map<String, Object> getPhone(HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        Object rawId = session.getAttribute("userId");
        Long userId = (rawId instanceof Number) ? ((Number) rawId).longValue() : null;

        if (userId == null) {
            res.put("status", "unauthorized");
            return res;
        }
        String phone = userBO.getPhoneNumber(userId);
        res.put("phone", phone);
        return res;
    }

    @PutMapping("/me/phone")
    public Map<String, Object> updatePhone(@RequestBody Map<String, String> body, HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        Object rawId = session.getAttribute("userId");
        Long userId = (rawId instanceof Number) ? ((Number) rawId).longValue() : null;

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
