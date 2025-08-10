package com.Ignis.user; 

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import com.Ignis.user.bo.UserBO;
import com.Ignis.user.entity.UserEntity;
import com.Ignis.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

@Controller
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;
    private final UserBO userBO;

    @GetMapping("/login/oauth2/success")
    public String oauth2LoginSuccess(HttpSession session) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oauth2User = oauthToken.getPrincipal();

            String email = oauth2User.getAttribute("email");
            String name  = oauth2User.getAttribute("name");
            String sub   = oauth2User.getAttribute("sub"); // Google 고유 ID

            // 1) 이미 회원이면: 바로 로그인 세션 세팅 후 Welcome
            UserEntity exists = userRepository.findByEmail(email);
            if (exists != null) {
                session.setAttribute("userId",   exists.getUserId());
                session.setAttribute("loginId",  exists.getUserLoginId());
                session.setAttribute("userName", exists.getName());
                return "redirect:/user/welcome";
            }

            // 2) 처음 온 사용자면: 회원가입 폼으로 보내되, 구글 정보 미리 채우기
            Map<String, Object> prefill = new HashMap<>();
            prefill.put("oauth", true);
            prefill.put("prefillEmail", email);
            prefill.put("prefillName", name);
            prefill.put("prefillLoginId", "google_" + sub); // 추천 로그인ID
            session.setAttribute("oauthPrefill", prefill);

            return "redirect:/user/sign-up";
        }

        // 혹시 인증 정보가 없으면 로그인 화면으로
        return "redirect:/user/login";
    }

    @GetMapping("/logout/kakao")
    public String kakaoLogout(HttpSession session) {
        session.invalidate();
        String kakaoLogoutUrl = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + "카카오REST_API_KEY"
                + "&logout_redirect_uri=" + URLEncoder.encode("http://localhost/user/logout-success", StandardCharsets.UTF_8);
        return "redirect:" + kakaoLogoutUrl;
    }

    @GetMapping("/logout/google")
    public String googleLogout(HttpServletRequest request, HttpServletResponse response, Authentication auth) {
        if (auth instanceof OAuth2AuthenticationToken oauth
                && "google".equals(oauth.getAuthorizedClientRegistrationId())) {

            OAuth2AuthorizedClient client =
                    authorizedClientService.loadAuthorizedClient("google", oauth.getName());

            if (client != null) {
                String accessToken = client.getAccessToken().getTokenValue();
                String refreshToken = client.getRefreshToken() != null
                        ? client.getRefreshToken().getTokenValue() : null;

                revokeGoogleToken(accessToken);
                if (refreshToken != null) revokeGoogleToken(refreshToken);

                authorizedClientService.removeAuthorizedClient("google", oauth.getName());
            }
        }

        request.getSession().invalidate();
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        return "redirect:/login";
    }

    private void revokeGoogleToken(String token) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        LinkedMultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("token", token);

        HttpEntity<LinkedMultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

        try {
            rt.postForEntity("https://oauth2.googleapis.com/revoke", entity, String.class);
        } catch (Exception e) {
            // 로그만 남기고 무시 가능
        }
    }

    // 🔹 여기서부터 추가: /api/user 엔드포인트
    @RestController
    @RequestMapping("/api")
    @RequiredArgsConstructor
    static class UserApiController {
        @GetMapping("/user")
        public Map<String, Object> me(Authentication auth, HttpSession session) {
            Map<String, Object> res = new HashMap<>();
            if (auth == null) {
                res.put("authenticated", false);
                return res;
            }
            Object name = session.getAttribute("username");
            if (name == null && auth.getPrincipal() instanceof OAuth2User oAuth2User) {
                name = oAuth2User.getAttribute("name");
                if (name == null) name = oAuth2User.getAttribute("given_name");
                if (name == null) name = auth.getName();
            } else if (name == null) {
                name = auth.getName();
            }
            res.put("authenticated", true);
            res.put("userName", name);
            return res;
        }
    }
}
