package com.Ignis.home.funding;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/funding")
public class FundingRestController {

    @Autowired
    private FundingBO fundingBO;

    @PostMapping("/create")
    public Map<String, Object> createFunding(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("maxPrice") Integer maxPrice,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            result.put("code", 401);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        Funding funding = new Funding();
        funding.setUserId(userId);
        funding.setTitle(title);
        funding.setDescription(description);
        funding.setMaxPrice(maxPrice);
        funding.setCurrentPrice(0);
        funding.setStatus("PENDING");

        try {
            fundingBO.insertFunding(funding, file);
            result.put("result", "success");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("result", "fail");
        }

        return result;
    }
}
