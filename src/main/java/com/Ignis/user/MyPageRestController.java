package com.Ignis.user;

import com.Ignis.user.bo.UserBO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.PublicKey;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageRestController {

    private final UserBO userBO;

    @PostMapping("/change-password")
    public Map<String, Object> changePassword(@RequestParam String currentPassword,
                                              @RequestParam String newPassword,
                                              HttpSession session){
        Map<String, Object> result = new HashMap<>();
        Long userID = (Long) session.getAttribute("userID");

        if(userID == null){
            result.put("code", 401);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        boolean success = userBO.updatePassword(userID, currentPassword, newPassword);
        if(success){
            result.put("result", "비밀번호가 변경되었습니다.");
        }
        else{
            result.put("code", 400);
            result.put("error_message", "현재 비밀번호가 올바르지 않습니다.");
        }
        return result;
    }

    @PostMapping("/change-email")
    public Map<String,Object> changeEmail(@RequestParam String newEmail, HttpSession session){
        Map<String, Object> result = new HashMap<>();
        Long userID = (Long) session.getAttribute("userID");

        if(userID == null){
            result.put("code", 401);
            result.put("error_message","로그인이 필요합니다.");
            return result;
        }

        boolean success = userBO.updateEmail(userID, newEmail);
        if(success){
            result.put("result","이메일이 변경되었습니다.");
        }
        else{
            result.put("code", 400);
            result.put("error_message", "이메일 변경 실패");
        }
        return result;
    }
}
