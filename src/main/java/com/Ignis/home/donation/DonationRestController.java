package com.Ignis.home.donation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletResponse;

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
            @RequestBody Donation donation,
            HttpSession session,
            HttpServletResponse response) {

        Map<String, Object> result = new HashMap<>();

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 🔥 실제 HTTP 401로 응답
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }

        donation.setUserId(userId);
        donation.setStatus("PENDING");

        if (donation.getCurrentPrice() == null) {
            donation.setCurrentPrice(0);
        }
        if (donation.getRejectReason() == null) {
            donation.setRejectReason("");
        }

        System.out.println("✅ 최종 insert할 donation 객체: " + donation);

        try {
            int rows = donationBO.insertDonation(donation);
            System.out.println("✅ insert된 row 수: " + rows);
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
}
