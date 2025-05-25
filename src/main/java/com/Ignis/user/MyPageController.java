package com.Ignis.user;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    @GetMapping
    public String myPage(HttpSession session, Model model){
        String userName = (String) session.getAttribute("userName");
        model.addAttribute("userName", userName);
        return "mypage/myPage";
    }
}
