package com.Ignis.config;

import java.util.List;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.server.CookieSameSiteSupplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
                .ignoring().requestMatchers(
                        "/assets/**", "/favicon.ico", "/index.html",
                        "/manifest.webmanifest", "/robots.txt",
                        "/static/**", "/css/**", "/js/**", "/images/**",
                        "/uploads/**", "/.well-known/**"
                );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/index.html",
                                "/assets/**", "/favicon.ico",
                                "/robots.txt", "/manifest.webmanifest",
                                "/IgnisIcon.png", "/uploads/**",
                                "/images/**", "/.well-known/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/donation/**", "/volunteer/**", "/funding/**",
                                "/board/**", "/post/**", "/notice/**",
                                "/search/**", "/admin/**"
                        ).permitAll()
                        .requestMatchers(
                                "/oauth2/**", "/login/**",
                                "/user/**", "/api/**",
                                "/comment/**", "/react-app/**"
                        ).permitAll()
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        // ✅ 컨트롤러로 반드시 진입시키기
                        .defaultSuccessUrl("/login/oauth2/success", true)
                        .failureUrl("/login?error=true")
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
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        http.requiresChannel(channel -> channel.anyRequest().requiresSecure());

        // CSP 완화 (필요 시 유지, Nginx에서 관리한다면 제거해도 됨)
        http.headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                        .policyDirectives("script-src 'self' 'unsafe-eval' 'unsafe-inline' https: data: blob; object-src 'none';")
                )
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "https://www.igniskr.com",
                "https://igniskr.com",
                "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public CookieSameSiteSupplier cookieSameSiteSupplier() {
        return CookieSameSiteSupplier.ofNone();
    }
}
