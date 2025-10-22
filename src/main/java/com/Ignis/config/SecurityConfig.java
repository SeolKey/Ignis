package com.Ignis.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import jakarta.servlet.http.Cookie;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/donation/**", "/volunteer/**", "/funding/**",
            "/board/**", "/post/**", "/notice/**", "/search/**", "/mypage/**", "/admin/**").permitAll()
                .requestMatchers(
                   "/api/user",
                    "/oauth2/**", "/login/**",
                    "/user/**",
                    "/error", "/public/**",
                    "/css/**", "/js/**", "/images/**", "/favicon.ico", "/uploads/**",
                    "/donation/react/list", "/donation/react/detail/**","/donation/react/create",
                    "/funding/**",
                    "/api/**",
                    "/mypage/**",
                    "/volunteer/react/list", "/volunteer/react/detail/**" ,
                    "/comment/list","/comment/create",
                    "/", "/index.html", "/react-app/**", "/assets/**", "/uploads/**"
                ).permitAll()
                .anyRequest().authenticated()
            )

            .exceptionHandling(e -> e
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            )

            // 🔹 로그인 성공 시 컨트롤러로 이동
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
