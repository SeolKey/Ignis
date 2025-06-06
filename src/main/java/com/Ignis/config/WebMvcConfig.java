package com.Ignis.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 현재 실행 위치에서 static까지의 절대 경로 만들기
        String staticFundingPath = new File("src/main/resources/static/images/funding/").getAbsolutePath();

        registry.addResourceHandler("/images/funding/**")
                .addResourceLocations("file:///" + staticFundingPath + "/");
    }
}
