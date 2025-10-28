package com.Ignis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.base-dir}")
    private String baseDir;

    @Value("${upload.base-url:/uploads}")
    private String baseUrl;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ React 정적 리소스 (빌드 결과물) 매핑
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // ✅ 업로드 디렉터리 매핑
        if (StringUtils.hasText(baseUrl) && baseUrl.startsWith("/")) {
            String location = Paths.get(baseDir).toAbsolutePath().toUri().toString();
            registry.addResourceHandler(baseUrl + "/**")
                    .addResourceLocations(location);
        }
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // ✅ 루트 및 모든 하위 경로를 React index.html로 포워딩
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}
