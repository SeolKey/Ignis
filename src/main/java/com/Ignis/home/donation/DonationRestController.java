package com.Ignis.home.donation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.Ignis.payment.DonationPaymentBO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/donation")
public class DonationRestController {

    @Autowired
    private DonationBO donationBO;

    @Autowired
    private DonationPaymentBO donationPaymentBO;

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
    public ResponseEntity<?> getDonationApi(@PathVariable("id") Long donationId) {
        Donation d = donationBO.getDonationById(donationId);
        if (d == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("result", "fail"));
        }

        // ✅ 이미지 경로 풀 URL로 보정
        String path = d.getImagePath();
        if (path != null && !path.startsWith("http")) {
            if (!path.startsWith("/"))
                path = "/" + path;
            String base = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .build().toUriString(); // ex) http://localhost
            d.setImagePath(base + path); // http://localhost/images/donation/xxx.png
        }

        return ResponseEntity.ok(d);
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

    @GetMapping("/api/most-viewed")
    public List<Donation> getMostViewed(@RequestParam(defaultValue = "10") int limit) {
        return donationBO.getMostViewedDonationList(limit);
    }

    // 리액트 전용 - 최신/조회순 목록 API (페이지네이션)
    // 예) /api/donation/list?sort=latest&page=0&size=20
    // /api/donation/list?sort=views&page=0&size=12
    @CrossOrigin(origins = "${app.frontend-url}", allowCredentials = "true")
    @GetMapping({ "/react/list", "/api/donation/list" })
    public ResponseEntity<?> getDonationListForReact(
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0)
            page = 0;
        if (size <= 0)
            size = 20;

        // limit = (page+1)*size 만큼 넉넉히 가져와서 컨트롤러에서 슬라이스
        int limit = Math.max(size * (page + 1), size);
        List<Donation> base;

        if ("views".equalsIgnoreCase(sort)) {
            // 조회수 순
            base = donationBO.getMostViewedDonationList(limit);
        } else {
            // 최신 순
            base = donationBO.getRecentDonationList(limit);
        }

        // 페이지 슬라이스
        int from = Math.min(page * size, base.size());
        int to = Math.min(from + size, base.size());
        List<Donation> slice = base.subList(from, to);

        // DTO 변환 (프론트에서 쓰는 필드만 노출)
        List<Map<String, Object>> items = slice.stream().map(d -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("donationId", d.getDonationId());
            m.put("title", d.getTitle());
            m.put("description", d.getDescription());
            m.put("imagePath", d.getImagePath());
            m.put("maxPrice", d.getMaxPrice());
            m.put("currentPrice", d.getCurrentPrice());
            m.put("views", d.getViewCount()); // ✅ Domain에 맞춤
            m.put("createdAt", d.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("items", items);
        body.put("page", page);
        body.put("size", size);
        body.put("total", base.size());
        body.put("totalPages", (int) Math.ceil((base.size() + (double) size - 1) / size));

        return ResponseEntity.ok(body);
    }
// DonationPaymentRestController에 문제가 생길 경우 아래 주석 제거 후 사용
//    private Long currentUserId(HttpSession session) {
//        Object id = session.getAttribute("userId");
//        if (id == null) id = session.getAttribute("userID");
//        if (id instanceof Long) return (Long) id;
//        if (id instanceof Integer) return ((Integer) id).longValue();
//        return null;
//    }
//
//    @PostMapping("/pay/prepare")
//    public Map<String, Object> preparePay(@RequestParam Long donationId,
//                                          @RequestParam int amount,
//                                          @RequestParam(required = false) String buyerName,
//                                          @RequestParam(required = false) String buyerEmail,
//                                          @RequestParam(required = false) String buyerTel,
//                                          HttpSession session) {
//        Map<String, Object> res = new HashMap<>();
//        try {
//            Long userId = currentUserId(session);
//            if (userId == null) {
//                res.put("code", 401);
//                res.put("error_message", "로그인이 필요합니다.");
//                return res;
//            }
//            DonationPaymentBO.PrepareResult pr = donationPaymentBO.prepareDonation(
//                    userId, donationId, amount, buyerName, buyerEmail, buyerTel
//            );
//            res.put("result", "success");
//            res.put("merchantUid", pr.getMerchantUid());
//            res.put("name", pr.getName());     // 결제창 표시용(기부 제목)
//            res.put("amount", pr.getAmount());
//            res.put("buyerName", pr.getBuyerName());
//            res.put("buyerEmail", pr.getBuyerEmail());
//            res.put("buyerTel", pr.getBuyerTel());
//            return res;
//        } catch (IllegalArgumentException e) {
//            res.put("code", 400);
//            res.put("error_message", e.getMessage());
//            return res;
//        } catch (IllegalStateException e) {
//            res.put("code", 500);
//            res.put("error_message", e.getMessage());
//            return res;
//        } catch (Exception e) {
//            res.put("code", 500);
//            res.put("error_message", "결제 사전등록 중 오류가 발생했습니다.");
//            return res;
//        }
//    }
//
//
//    @PostMapping("/pay/complete")
//    public Map<String, Object> completePay(@RequestParam String impUid,
//                                           @RequestParam String merchantUid,
//                                           @RequestParam Long donationId) {
//        Map<String, Object> res = new HashMap<>();
//        try {
//            DonationPaymentBO.CompletedPayment done = donationPaymentBO.completeDonation(impUid, merchantUid, donationId);
//            res.put("result", "success");
//            res.put("donationId", done.getDonationId());
//            res.put("amount", done.getAmount());
//            res.put("impUid", done.getImpUid());
//            res.put("merchantUid", done.getMerchantUid());
//            return res;
//        } catch (Exception e) {
//            res.put("code", 400);
//            res.put("error_message", e.getMessage());
//            return res;
//        }
//    }

}
