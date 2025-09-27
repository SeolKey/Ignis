package com.Ignis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
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
        // baseUrl이 /uploads 같은 내부 URL이면, 외부 디렉토리를 정적 리소스로 연결
        if (StringUtils.hasText(baseUrl) && baseUrl.startsWith("/")) {
            String location = Paths.get(baseDir).toAbsolutePath().toUri().toString();
            registry.addResourceHandler(baseUrl + "/**")
                    .addResourceLocations(location);
        }
    }
}
