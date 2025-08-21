package com.Ignis.home.donation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.multipart.MultipartFile;

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
            donationBO.insertDonation(donation, file);
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

    // 상세 JSON API
    @GetMapping("/api/{id}")
    public Donation getDonationApi(@PathVariable("id") Long donationId) {
        return donationBO.getDonationById(donationId);
    }

    // 제한 목록 JSON API
    @GetMapping("/api/list")
    public List<Donation> getDonationListLimited(@RequestParam(name = "limit", defaultValue = "10") int limit) {
        return donationBO.getRecentDonationList(limit);
    }

    // ✅ 기부 참여 API (amount는 선택, 기본 1000)
    @PostMapping("/{donationId}/participate")
    public Map<String, Object> participateDonation(
            @PathVariable("donationId") Long donationId,
            @RequestParam(name = "amount", required = false, defaultValue = "1000") Integer amount,
            HttpSession session,
            HttpServletResponse response) {

        Map<String, Object> result = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        try {
            donationBO.participateDonation(userId, donationId, amount);
            result.put("result", "success");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("result", "fail");
            result.put("error_message", e.getMessage());
        }

        return result;
    }
}
