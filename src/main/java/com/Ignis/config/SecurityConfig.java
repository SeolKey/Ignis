package com.Ignis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // 정적 리소스 & 공개 페이지
                .requestMatchers(
                    "/", "/error", "/favicon.ico",
                    "/user/login", "/login",                 // 로그인 페이지
                    "/oauth2/**", "/login/oauth2/**",        // OAuth2 로그인 흐름(인가/토큰/콜백)
                    "/login/oauth2/success",                 // 성공 처리 컨트롤러
                    "/css/**", "/js/**", "/img/**"
                ).permitAll()

                // (원래 공개하려던 경로가 있으면 추가)
                .requestMatchers("/user/**", "/mypage/**").permitAll()

                .anyRequest().authenticated()
            )

            .oauth2Login(oauth -> oauth
                .loginPage("/user/login")                   // 커스텀 로그인 페이지
                .defaultSuccessUrl("/login/oauth2/success", true) // 공통 성공 처리
                // redirectionEndpoint/baseUri 커스터마이징 불필요
            )

            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")                      // 로그아웃 후 홈
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}
