package com.Ignis.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.post.bo.PostBO;
import com.Ignis.home.funding.bo.FundingBO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminRestController {

    private final PostBO postBO;
    private final DonationBO donationBO;
    private final FundingBO fundingBO;

    @DeleteMapping("/delete-post/{id}")
    public Map<String, Object> deletePost(@PathVariable int id) {
        Map<String, Object> result = new HashMap<>();

        postBO.deletePostById(id);  // BO에서 삭제 로직 실행
        result.put("result", "삭제 완료");

        return result;
    }

    @PostMapping("/donation-status-update")
    public String updateDonationStatus(@RequestParam("donationId") Long donationId,
                                       @RequestParam("status") Status status) {
        donationBO.updateDonationStatus(donationId, status);
        return "상태 변경 완료";
    }

    @DeleteMapping("/donation-delete/{id}")
    public Map<String, Object> deleteDonation(@PathVariable("id") int donationId) {
        Map<String, Object> result = new HashMap<>();

        donationBO.deletedonation(donationId);
        result.put("result", "삭제 성공");
        return result;
    }

    @PostMapping("/funding-status-update")
    public String updateFundingStatus(@RequestParam("fundingId") Long fundingId, @RequestParam("status") Status status, @RequestParam(value = "rejectReason", required = false) String rejectReason) {
        fundingBO.updateFundingStatus(fundingId, status, rejectReason);
        return "상태 변경 완료";
    }
}
