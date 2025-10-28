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

    /** 400(Bad Request) 방지용: URL 인코딩/세미콜론 등 허용 완화 */
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
        return web -> web
                .httpFirewall(firewall)
                // ✅ 정적 리소스는 완전히 Security 필터 제외
                .ignoring().requestMatchers(
                        "/assets/**",
                        "/favicon.ico",
                        "/index.html",
                        "/manifest.webmanifest",
                        "/robots.txt",
                        "/static/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/uploads/**"
                );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl) throws Exception {

        http
            // SPA + API 조합: 보통 CSRF 비활성화
            .csrf(csrf -> csrf.disable())
            // 같은 오리진에서 정적 서빙 → CORS 불필요
            .cors(cors -> cors.disable())

            .authorizeHttpRequests(auth -> auth
                // ✅ React 정적 리소스 & 루트 허용 (Vite 빌드 산출물)
                .requestMatchers(
                    "/", "/index.html",
                    "/assets/**", "/favicon.ico", "/robots.txt", "/manifest.webmanifest",
                    "/uploads/**", "/.well-known/**", "/error"
                ).permitAll()

                // ✅ 업로드 공개 경로
                .requestMatchers("/uploads/**").permitAll()

                // ✅ (선택) 공개 GET 엔드포인트
                .requestMatchers(HttpMethod.GET,
                    "/donation/**", "/volunteer/**", "/funding/**",
                    "/board/**", "/post/**", "/notice/**",
                    "/search/**", "/mypage/**", "/admin/**"
                ).permitAll()

                // ✅ OAuth/로그인/공개 경로 (필요에 맞게 조정)
                .requestMatchers(
                    "/oauth2/**", "/login/**",
                    "/user/**",
                    "/error", "/public/**",
                    "/css/**", "/js/**", "/images/**",
                    "/donation/react/list", "/donation/react/detail/**", "/donation/react/create",
                    "/funding/**",
                    "/api/**",        // 지금은 공개(테스트 편의). 보호하려면 authenticated()로 변경
                    "/volunteer/react/list", "/volunteer/react/detail/**",
                    "/comment/list", "/comment/create",
                    "/react-app/**"  // 과거 배포 호환
                ).permitAll()

                // ✅ 임시로 나머지도 허용 (401 방지). 추후 필요한 구간만 authenticated()로 전환
                .anyRequest().permitAll()
            )

            // OAuth2 로그인 성공 후 경로(현행 유지)
            .oauth2Login(oauth -> oauth
                .defaultSuccessUrl("/login/oauth2/success", true)
            )

            // 로그아웃: 세션/쿠키 제거 후 동일 오리진 /login
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessHandler((req, res, auth) -> {
                    req.getSession().invalidate();
                    Cookie c = new Cookie("JSESSIONID", "");
                    c.setPath("/");
                    c.setMaxAge(0);
                    res.addCookie(c);
                    res.sendRedirect("/login");
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
