package com.Ignis.user;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/login")
    public String loginForm() {
        return "user/login-form";
    }

    @GetMapping("/sign-up")
    public String signUpForm(HttpSession session, Model model) {
        Object obj = session.getAttribute("oauthPrefill");
        if (obj != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) obj;

            // boolean 처리
            Object oauthObj = map.get("oauth");
            boolean oauth = (oauthObj instanceof Boolean) ? (Boolean) oauthObj : false;
            model.addAttribute("oauth", oauth);

            // String 처리
            Object loginIdObj = map.get("prefillLoginId");
            Object nameObj    = map.get("prefillName");
            Object emailObj   = map.get("prefillEmail");

            model.addAttribute("prefillLoginId", loginIdObj instanceof String ? (String) loginIdObj : "");
            model.addAttribute("prefillName",    nameObj    instanceof String ? (String) nameObj    : "");
            model.addAttribute("prefillEmail",   emailObj   instanceof String ? (String) emailObj   : "");

            // 한 번 사용 후 제거
            session.removeAttribute("oauthPrefill");
        } else {
            model.addAttribute("oauth", false);
        }
        return "user/sign-up";
    }

    @GetMapping("/welcome")
    public String welcome(HttpSession session, Model model) {
        String userName = (String) session.getAttribute("userName");
        List<UserEntity> users = userRepository.findByName(userName);
        if (!users.isEmpty()) {
            model.addAttribute("user", users.get(0).getName());
            model.addAttribute("createdAt", users.get(0).getCreatedAt());
            model.addAttribute("userId", users.get(0).getUserId());
        }
        return "user/welcome";
    }

    /**
     * ✅ 로그아웃 기능
     * 세션에 저장된 모든 사용자 정보를 제거하고 홈 화면으로 리다이렉트
     */
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate(); // 세션 전체 초기화 (userId, userName, role 등 모두 제거)
        return "redirect:/";  // 홈 화면으로 이동
    }

    @GetMapping("/logout-success")
    public String logoutSuccess() {
        return "redirect:/user/login"; // 로그인 페이지로 리다이렉트
    }
}
