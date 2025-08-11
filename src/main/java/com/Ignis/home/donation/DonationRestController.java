package com.Ignis.home.donation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/donation")
public class DonationRestController {

    @Autowired
    private DonationBO donationBO;

    @GetMapping("/list")
    public List<Donation> getDonationList() {
        System.out.println("✅ getDonationList() 호출됨");
        return donationBO.getDonationList();
    }

    @PostMapping("/create")
    public Map<String, Object> createDonation(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "accountInfo", required = false) String accountInfo,
            @RequestParam("maxPrice") Integer maxPrice,
            @RequestParam(value = "currentPrice", required = false, defaultValue = "0") Integer currentPrice,
            @RequestParam(value = "rejectReason", required = false, defaultValue = "") String rejectReason,
            @RequestParam(value = "file", required = false) MultipartFile file,
            HttpSession session,
            HttpServletResponse response) {

        Map<String, Object> result = new HashMap<>();

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        // ✅ Donation 객체 생성 및 필드 설정
        Donation donation = new Donation();
        donation.setUserId(userId);
        donation.setTitle(title);
        donation.setDescription(description);
        donation.setAccountInfo(accountInfo);
        donation.setMaxPrice(maxPrice);
        donation.setCurrentPrice(currentPrice);
        donation.setRejectReason(rejectReason);
        donation.setStatus("PENDING");

        try {
            donationBO.insertDonation(donation, file); // ✅ 이미지 포함 처리
            result.put("result", "success");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("result", "fail");
            result.put("error_message", e.getMessage());
        }

        return result;
    }

    @PostMapping("/update-status")
    public Map<String, Object> updateDonationStatus(
            @RequestParam("donationId") Long donationId,
            @RequestParam("status") Status status) {

        Map<String, Object> result = new HashMap<>();
        donationBO.updateDonationStatus(donationId, status);
        result.put("result", "상태 변경 완료");
        return result;
    }

    // ========== [추가] 상세 JSON API ==========
    // React 상세 페이지용: GET /donation/api/{id}
    @GetMapping("/api/{id}")
    public Donation getDonationApi(@PathVariable Long id) {
        return donationBO.getDonationById(id);
    }

    // ========== [추가-옵션] 제한 목록 JSON API ==========
    // 홈 카드에서 4개만 등: GET /donation/api/list?limit=4
    @GetMapping("/api/list")
    public List<Donation> getDonationListLimited(@RequestParam(defaultValue = "10") int limit) {
        // BO 메서드명에 맞게 조정 가능 (예: getRecentDonationList(limit))
        return donationBO.getRecentDonationList(limit);
        // return donationBO.getDonationListLimit(limit);
    }
}
