package com.Ignis.home.funding;

import java.util.HashMap;
import java.util.Map;

import com.Ignis.common.enums.Status;
import com.Ignis.home.funding.bo.FundingPriceBO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @Autowired
    private FundingPriceBO fundingPriceBO;

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

    @PostMapping("/participate")
    public String participateFunding(
            @RequestParam("fundingId") Long fundingId,
            @RequestParam("givePrice") Integer givePrice,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return "redirect:/user/sign-in-view";
        }

        fundingPriceBO.participateFunding(userId, fundingId, givePrice);

        session.setAttribute("participationUserId", userId);
        session.setAttribute("participationFundingId", fundingId);
        session.setAttribute("participationGivePrice", givePrice);

        return "redirect:/funding/participate-complete";
    }

    @PostMapping("/update-status")
    public Map<String,Object> updateStatus(
    		@RequestParam("fundingId") Long fundingId,
            @RequestParam("status") Status status,
            @RequestParam(value = "rejectReason", required = false) String rejectReason){
    	fundingBO.updateFundingStatus(fundingId, status, rejectReason);
        Map<String, Object> result = new HashMap<>();
        result.put("result", "success");
        return result;
    }



}
