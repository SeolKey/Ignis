package com.Ignis.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.Cookie;

@Configuration
public class SecurityConfig {

    // ✅ 경로 인코딩 허용 (React 라우팅, 이미지 URL에 필요)
    @Bean
    public HttpFirewall httpFirewall() {
        StrictHttpFirewall fw = new StrictHttpFirewall();
        fw.setAllowSemicolon(true);
        fw.setAllowUrlEncodedSlash(true);
        fw.setAllowUrlEncodedDoubleSlash(true);
        fw.setAllowUrlEncodedPercent(true);
        fw.setAllowBackSlash(true);
        return fw;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer(HttpFirewall firewall) {
        return web -> web.httpFirewall(firewall);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())

            .authorizeHttpRequests(auth -> auth
                // ✅ React 정적 리소스 전부 허용
                .requestMatchers(
                    "/", "/index.html", "/assets/**",
                    "/favicon.ico", "/IgnisIcon.png",
                    "/IgnisLogo-58y9OAqq.png",
                    "/test_banner.png", "/uploads/**",
                    "/css/**", "/js/**", "/images/**",
                    "/react-app/**"
                ).permitAll()

                // ✅ API 및 공개 경로
                .requestMatchers(
                    "/api/**",
                    "/donation/**", "/volunteer/**", "/funding/**",
                    "/board/**", "/post/**", "/notice/**", "/search/**",
                    "/mypage/**", "/admin/**",
                    "/oauth2/**", "/login/**", "/user/**",
                    "/error", "/public/**",
                    "/comment/list", "/comment/create"
                ).permitAll()

                // ✅ 그 외 인증 필요
                .anyRequest().authenticated()
            )

            // ✅ 인증 실패 시 401 반환
            .exceptionHandling(e -> e
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            )

            // ✅ OAuth2 로그인 성공 시 리다이렉트
            .oauth2Login(oauth -> oauth
                .defaultSuccessUrl("/login/oauth2/success", true)
            )

            // ✅ 로그아웃 처리
            .logout(logout -> logout
                .logoutUrl("/logout")
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String frontendUrl) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
