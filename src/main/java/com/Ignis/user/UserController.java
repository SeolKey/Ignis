package com.Ignis.user;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/login")
    public String loginForm() {
        return "login-form";
    }

    @GetMapping("/sign-up")
    public String signUpForm() {
        return "sign-up";
    }

    @GetMapping("/welcome")
    public String welcome(HttpSession session, Model model) {
        String userName = (String) session.getAttribute("user");
        List<UserEntity> users = userRepository.findByName(userName);
        if (!users.isEmpty()) {
            model.addAttribute("user", users.get(0).getName());
            model.addAttribute("createdAt", users.get(0).getCreatedAt());
        }
        return "welcome";
    }
}
