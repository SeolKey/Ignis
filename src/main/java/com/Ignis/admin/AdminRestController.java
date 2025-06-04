package com.Ignis.admin;

import com.Ignis.common.enums.Status;
import com.Ignis.donation.bo.DonationBO;
import com.Ignis.post.bo.PostBO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminRestController {

    private final PostBO postBO;
    private final DonationBO donationBO;

    @DeleteMapping("/delete-post/{id}")
    public Map<String, Object> deletePost(@PathVariable int id) {
        Map<String, Object> result = new HashMap<>();

        postBO.deletePostById(id);  // BO에서 삭제 로직 실행
        result.put("result", "삭제 완료");

        return result;
    }

    @PostMapping("/donation-status-update")
    public String updateDonationStatus(@RequestParam("donationId") int donationId,
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
}
