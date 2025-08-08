package com.Ignis.user;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.Ignis.user.bo.UserBO;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class OAuth2Controller {

    private final UserRepository userRepository;
    private final UserBO userBO;

    @GetMapping("/login/oauth2/success")
    public String oauth2LoginSuccess(HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // "google" or "kakao"
            OAuth2User oauth2User = oauthToken.getPrincipal();

            String email = null;
            String name = null;
            String uniqueId = null; // provider별 고유 식별자

            if ("google".equals(registrationId)) {
                // 구글 로그인 데이터
                email = oauth2User.getAttribute("email");
                name = oauth2User.getAttribute("name");
                uniqueId = oauth2User.getAttribute("sub");
            } else if ("kakao".equals(registrationId)) {
                // 카카오 로그인 데이터
                Map<String, Object> kakaoAccount = oauth2User.getAttribute("kakao_account");
                Map<String, Object> properties = oauth2User.getAttribute("properties");

                email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
                name = properties != null ? (String) properties.get("nickname") : null;
                uniqueId = oauth2User.getAttribute("id").toString();
            }

            if (email == null) {
                // 이메일이 없으면 로그인 실패 처리
                return "redirect:/login?error=email_required";
            }

            // DB 조회
            UserEntity user = userRepository.findByEmail(email);

            // 신규 회원이면 가입 처리
            if (user == null) {
                user = new UserEntity();
                user.setUserLoginId(registrationId + "_" + uniqueId);
                user.setPassword("oauth"); // 암호화 X, OAuth 계정
                user.setName(name != null ? name : "이름없음");
                user.setEmail(email);
                user.setPhoneNumber("000-0000-0000");
                user.setRole("USER");
                user.setEmailVerified(true);
                userBO.signUp(user);
            }

            // 세션 저장
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("loginId", user.getUserLoginId());
            session.setAttribute("userName", user.getName());
        }

        return "redirect:/user/welcome";
    }
    
    @GetMapping("/logout/kakao")
    public String kakaoLogout(HttpSession session) {
        session.invalidate(); // 내 서비스 세션 끊기

        String kakaoLogoutUrl = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + "c1f92469acda1a6e84390ab7c9a314c1" // 반드시 실제 영문/숫자 키
                + "&logout_redirect_uri=" + URLEncoder.encode("http://localhost/user/logout-success", StandardCharsets.UTF_8);

        return "redirect:" + kakaoLogoutUrl;
    }
}
