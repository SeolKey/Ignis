package com.Ignis.donation;


import com.Ignis.common.enums.Status;
import com.Ignis.donation.bo.DonationBO;
import com.Ignis.donation.domain.Donation;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/donation")
@RequiredArgsConstructor
public class DonationRestController {

    private final DonationBO donationBO;

    @PostMapping("/create")
    public Map<String, Object> createDonation(@RequestParam("title") String title,
                                              @RequestParam("description") String description,
                                              @RequestParam("accountInfo") String accountInfo,
                                              @RequestParam("maxPrice") int maxPrice,
                                              @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
                                              HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            result.put("code", "401");
            result.put("error", "로그인 필요");
            return result;
        }

        String imagePath = "";
        if (imageFile != null && !imageFile.isEmpty()) {

            String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/images/";
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            try {
                File dest = new File(uploadDir + fileName);
                imageFile.transferTo(dest);
                imagePath = "/images/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                result.put("error", "이미지 업로드 실패");
                return result;
            }
        }

        Donation donation = new Donation();
        donation.setUserId(userId);
        donation.setTitle(title);
        donation.setDescription(description);
        donation.setAccountInfo(accountInfo);
        donation.setMaxPrice(maxPrice);
        donation.setImagePath(imagePath);
        donation.setStatus(Status.PENDING);

        donationBO.createDonation(donation);
        result.put("result", "성공");
        return result;
    }

    @PostMapping("/update-status")
    public Map<String, Object> updateDonationStatus(
            @RequestParam("donationId") int donationId,
            @RequestParam("status") Status status) {

        Map<String, Object> result = new HashMap<>();

        donationBO.updateDonationStatus(donationId, status);
        result.put("result", "상태 변경 완료");
        return result;
    }
}
