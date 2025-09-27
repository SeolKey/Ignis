package com.Ignis.home.mypage;

import com.Ignis.user.bo.UserBO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageRestController {

    private final UserBO userBO;

    /** 설정 페이지 접근 검증 타임스탬프 세션 키 (Controller와 동일 문자열 사용) */
    private static final String CONFIG_VERIFIED_AT = "CONFIG_VERIFIED_AT";

    /** 세션에서 userId/userID를 Long으로 복구 */
    private Long currentUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (id == null) id = session.getAttribute("userID");
        if (id instanceof Long) return (Long) id;
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof String s && s.matches("\\d+")) return Long.parseLong(s);
        return null;
    }

    /** ▼▼ 신규: 설정 페이지 입장 전 비밀번호 확인 */
    @PostMapping(value="/verify", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> verify(@RequestParam("password") String password,
                                      HttpSession session){
        Map<String, Object> res = new HashMap<>();
        Long userId = currentUserId(session);
        if (userId == null) {
            res.put("ok", false);
            res.put("code", 401);
            res.put("msg", "로그인이 필요합니다.");
            return res;
        }

        boolean ok = userBO.checkPassword(userId, password); // DB 해시와 비교
        if (!ok) {
            res.put("ok", false);
            res.put("code", 400);
            res.put("msg", "비밀번호가 올바르지 않습니다.");
            return res;
        }

        // 통과 → 세션에 검증 시각 기록(Controller에서 5분 이내만 허용)
        session.setAttribute(CONFIG_VERIFIED_AT, System.currentTimeMillis());
        res.put("ok", true);
        return res;
    }
    /** ▲▲ 신규 끝 */

    @PostMapping(value="/change-password", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> changePassword(@RequestParam String currentPassword,
                                              @RequestParam String newPassword,
                                              HttpSession session){
        Map<String, Object> result = new HashMap<>();
        Long userId = currentUserId(session);

        if (userId == null){
            result.put("code", 401);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        boolean success = userBO.updatePassword(userId, currentPassword, newPassword);
        if(success){
            result.put("result", "비밀번호가 변경되었습니다.");
        } else{
            result.put("code", 400);
            result.put("error_message", "현재 비밀번호가 올바르지 않습니다.");
        }
        return result;
    }

    @PostMapping(value="/change-email", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String,Object> changeEmail(@RequestParam String newEmail, HttpSession session){
        Map<String, Object> result = new HashMap<>();
        Long userId = currentUserId(session);

        if (userId == null){
            result.put("code", 401);
            result.put("error_message","로그인이 필요합니다.");
            return result;
        }

        boolean success = userBO.updateEmail(userId, newEmail);
        if(success){
            result.put("result","이메일이 변경되었습니다.");
        } else{
            result.put("code", 400);
            result.put("error_message", "이메일 변경 실패");
        }
        return result;
    }
}
