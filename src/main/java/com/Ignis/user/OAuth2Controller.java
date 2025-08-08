package com.Ignis.user;

import com.Ignis.user.bo.UserBO;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class OAuth2Controller {

    private final UserRepository userRepository;
    private final UserBO userBO;

    @GetMapping("/login/oauth2/success")
    public String oauth2LoginSuccess(HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oauth2User = oauthToken.getPrincipal();

            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String sub = oauth2User.getAttribute("sub"); // Google 고유 ID

            UserEntity user = userRepository.findByEmail(email);

            if (user == null) {
                user = new UserEntity();
                user.setUserLoginId("google_" + sub);
                user.setPassword("oauth");
                user.setName(name);
                user.setEmail(email);
                user.setPhoneNumber("000-0000-0000");
                user.setRole("USER");
                user.setEmailVerified(true);
                userBO.signUp(user);
            }

            session.setAttribute("userId", user.getUserId());
            session.setAttribute("loginId", user.getUserLoginId());
            session.setAttribute("userName", user.getName());
        }

        return "redirect:/user/welcome";
    }
}