package com.Ignis.home.funding;

import com.Ignis.common.enums.Status;
import com.Ignis.home.funding.bo.FundingPriceBO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;

import java.util.*;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.*; // 추가

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
    @GetMapping("/api/most-viewed")
    public List<Funding> mostViewed(@RequestParam(defaultValue = "10") int limit) {
        return fundingBO.getMostViewedFundingList(limit);
    }

    // =================== React 전용 API ===================

    /** 목록 */
    @GetMapping("/react/list")
    public ResponseEntity<?> getFundingListForReact() {
        List<Funding> list = fundingBO.getFundingList();
        return ResponseEntity.ok(Map.of("fundingList", list));
    }

    /** 상세 */
    @GetMapping("/react/detail/{id}")
    public ResponseEntity<?> getFundingDetailForReact(@PathVariable("id") Long fundingId) {
        Funding detail = fundingBO.getFundingById(fundingId);
        if (detail == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("result", "실패", "error", "NOT_FOUND"));
        }
        return ResponseEntity.ok(detail);
    }

    /** 생성 */
    @PostMapping("/react/create")
public ResponseEntity<?> createFundingForReact(
        @RequestParam String title,
        @RequestParam String description,
        @RequestParam("maxPrice") String maxPriceRaw,
        @RequestParam("file") MultipartFile file,
        HttpSession session) {

    Long userId = (Long) session.getAttribute("userId");
    if (userId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("result","fail","error","로그인 필요"));
    }

    // 이미지 필수
    if (file == null || file.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Map.of("result","fail","error","이미지 파일을 첨부해주세요."));
    }

    // 파일 메타 검증(BO에서 getOriginalFilename()/getContentType() 만질 때 NPE 방지)
    String originalName = file.getOriginalFilename();
    if (originalName == null || originalName.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of("result","fail","error","유효하지 않은 이미지 파일입니다."));
    }
    String contentType = file.getContentType();
    if (contentType == null || contentType.isBlank()) {
        return ResponseEntity.badRequest()
                .body(Map.of("result","fail","error","이미지 Content-Type 확인이 필요합니다."));
    }

    // 숫자 정규화
    String norm = (maxPriceRaw == null ? "" : maxPriceRaw).replaceAll("[^0-9]","");
    if (norm.isEmpty()) {
        return ResponseEntity.badRequest()
                .body(Map.of("result","fail","error","목표 금액을 입력해주세요."));
    }
    Integer maxPrice = Integer.valueOf(norm);

    try {
        Funding f = new Funding();
        // f.setUserId(userId.intValue()); // Integer면 이 줄
        f.setUserId(userId);               // Long이면 이 줄

        f.setTitle(title == null ? "" : title);
        f.setDescription(description == null ? "" : description);
        f.setMaxPrice(maxPrice);
        f.setCurrentPrice(0);
        if (f.getStatus() == null) f.setStatus("PENDING");
        if (f.getImagePath() == null) f.setImagePath(""); // BO/Mapper가 만져도 안전

        // 원본 MultipartFile 그대로 전달
        fundingBO.insertFunding(f, file);

        return ResponseEntity.ok(Map.of("result","성공","fundingId", f.getFundingId()));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("result","fail","error",
                        e.getClass().getSimpleName()+": "+String.valueOf(e.getMessage())));
    }
}


}
