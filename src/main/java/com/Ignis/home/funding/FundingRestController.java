package com.Ignis.home.funding;

import com.Ignis.common.enums.Status;
import com.Ignis.home.funding.bo.FundingPriceBO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;

import java.util.*;

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
    public Map<String, Object> updateStatus(
            @RequestParam("fundingId") Long fundingId,
            @RequestParam("status") Status status,
            @RequestParam(value = "rejectReason", required = false) String rejectReason) {
        fundingBO.updateFundingStatus(fundingId, status, rejectReason);
        Map<String, Object> result = new HashMap<>();
        result.put("result", "success");
        return result;
    }

    /** 목록: FundingList.jsx -> { fundingList: [...] } */
    @GetMapping("/react/list")
    public Map<String, Object> fundingListForReact() {
        Map<String, Object> res = new HashMap<>();
        List<Funding> list = fundingBO.getFundingList(); // BO 메서드명에 맞춰 사용
        res.put("fundingList", list);
        return res;
    }

    /** 상세: FundingDetail.jsx -> { funding: {...} } */
    @GetMapping("/react/detail/{id}")
    public Map<String, Object> fundingDetailForReact(@PathVariable("id") Long fundingId) {
        Map<String, Object> res = new HashMap<>();
        Funding funding = fundingBO.getFundingById(fundingId); // BO 메서드명에 맞춰 사용
        res.put("funding", funding);
        return res;
    }

    /** 생성: FundingCreate.jsx (x-www-form-urlencoded) */
    @PostMapping(value = "/react/create", consumes = "application/x-www-form-urlencoded")
    public Map<String, Object> fundingCreateForReact(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("maxPrice") Integer maxPrice, // ✅ Integer로 변경
            @RequestParam(value = "imagePath", required = false) String imagePath,
            HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                res.put("result", "실패");
                res.put("error", "로그인이 필요합니다.");
                return res;
            }

            Funding f = new Funding();
            f.setUserId(userId);
            f.setTitle(title);
            f.setDescription(description);
            f.setMaxPrice(maxPrice); // ✅ setter 시그니처에 맞춤
            if (imagePath != null)
                f.setImagePath(imagePath);
            // f.setAccountInfo(accountInfo); // ❌ Funding에 없으므로 제거

            // ✅ BO 메서드명에 맞춰 호출
            // 아래 두 줄 중 프로젝트에 존재하는 메서드명을 사용하세요.
            fundingBO.insertFunding(f, null);
            // fundingBO.createFunding(f); // ← BO에 이 메서드가 존재한다면 이걸로 교체

            res.put("result", "성공");
            // res.put("fundingId", f.getFundingId()); // BO/Mapper가 키 채우면 사용
        } catch (Exception e) {
            res.put("result", "실패");
            res.put("error", "DB 오류: " + e.getMessage());
        }
        return res;
    }



}
