package com.Ignis.config;

import java.util.List;

import jakarta.servlet.http.Cookie;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import org.springframework.http.HttpStatus;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl
    ) throws Exception {

        // 로그인 성공: 원래 가려던 URL이 있으면 그쪽, 없으면 프론트 홈으로
        var successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setDefaultTargetUrl(frontendUrl + "/"); // ex) http://localhost:5173/

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    // ✅ 공개 엔드포인트
                    "/api/user",              // 로그인 여부 확인용 → 공개로
                    "/oauth2/**", "/login/**",
                    "/user/**",               // 폼 로그인/회원가입 등 공개 경로가 있으면 유지
                    "/error", "/public/**",
                    "/css/**", "/js/**", "/images/**", "/favicon.ico"
                ).permitAll()
                .anyRequest().authenticated()
            )

            // ✅ API는 미인증 시 401 주도록 (HTML 리다이렉트 방지)
            .exceptionHandling(e -> e
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            )

            // ✅ OAuth2 로그인 성공 시 프론트로 리디렉트
            .oauth2Login(oauth -> oauth
                .successHandler((request, response, authentication) ->
                    successHandler.onAuthenticationSuccess(request, response, authentication)
                )
            )

            // ✅ 로그아웃: 세션/쿠키 삭제 후 프론트 로그인 페이지로
            .logout(logout -> logout
                .logoutUrl("/logout")                 // 기본 POST /logout
                .logoutSuccessHandler((req, res, auth) -> {
                    req.getSession().invalidate();
                    Cookie c = new Cookie("JSESSIONID", "");
                    c.setPath("/");
                    c.setMaxAge(0);
                    res.addCookie(c);
                    res.sendRedirect(frontendUrl + "/login");
                })
            );

        return http.build();
    }

    // ✅ CORS: 프론트 도메인에서의 쿠키 포함 요청 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String frontendUrl) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl)); // ex) http://localhost:5173
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
