package com.Ignis.home.donation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/donation")
public class DonationRestController {

    @Autowired
    private DonationBO donationBO;

    @GetMapping("/list")
    public List<Donation> getDonationList() {
    	System.out.println("✅ getDonationList() 호출됨");
        return donationBO.getDonationList(); // 또는 최신순 정렬
    }
   
    @PostMapping("/create")
    public Map<String, Object> createDonation(@RequestBody Donation donation, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        
        Long userId = (Long) session.getAttribute("userId");  // 여기
        if (userId == null) {
            result.put("code", 401);
            result.put("error_message", "로그인이 필요합니다.");
            return result;
        }
        
        donation.setUserId(userId); // 이거 빠지면 user_id는 null
        donation.setStatus("PENDING");
        
        try {
            donationBO.insertDonation(donation);
            result.put("result", "success");
        } catch (Exception e) {
            e.printStackTrace();  // 🔥 여기 로그 꼭 터지나 확인
            result.put("result", "fail");
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