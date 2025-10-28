package com.Ignis.config;

import jakarta.servlet.http.Cookie;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;

@Configuration
public class SecurityConfig {

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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())

                .authorizeHttpRequests(auth -> auth
                        // ✅ 나머지 공개 경로
                        .requestMatchers(
                                "/", "/error",
                                "/oauth2/**", "/login/**", "/user/**",
                                "/donation/**", "/funding/**", "/volunteer/**",
                                "/board/**", "/notice/**", "/mypage/**",
                                "/api/**", "/comment/**", "/react-app/**"
                        ).permitAll()
                        .anyRequest().permitAll()
                )

                .oauth2Login(oauth -> oauth
                        .defaultSuccessUrl("/login/oauth2/success", true)
                )

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
}
