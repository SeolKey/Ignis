package com.Ignis.home.funding;

import com.Ignis.common.enums.Status;
// import com.Ignis.home.funding.bo.FundingPriceBO;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.funding.domain.Funding;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpSession;
import java.util.*;

@RestController
@RequestMapping("/funding")
public class FundingRestController {

    @Autowired
    private FundingBO fundingBO;

    // @Autowired
    // private FundingPriceBO fundingPriceBO;

    @PostMapping("/create")
    public Map<String, Object> createFunding(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("maxPrice") Integer maxPrice,
            @RequestParam(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestParam(value = "subImage", required = false) MultipartFile subImage,
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
            // ✅ 수정된 BO 호출 (mainImage + subImage 함께 전달)
            fundingBO.insertFunding(funding, mainImage, subImage);

            result.put("result", "success");
        } catch (Exception e) {
            e.printStackTrace();
            result.put("result", "fail");
            result.put("error_message", e.getMessage());
        }

        return result;
    }

    @GetMapping("/{fundingId}/like/state")
    public ResponseEntity<?> likeState(@PathVariable Long fundingId, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        boolean liked = fundingBO.isLiked(userId, fundingId);
        int likeCount = fundingBO.likeCount(fundingId);
        return ResponseEntity.ok(Map.of("liked", liked, "likeCount", likeCount));
    }

    @PostMapping("/{fundingId}/like/toggle")
    public ResponseEntity<?> toggleLike(@PathVariable Long fundingId, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result", "fail", "error", "로그인이 필요합니다."));
        }
        FundingBO.ToggleResult tr = fundingBO.toggleLike(userId, fundingId);
        return ResponseEntity.ok(Map.of("result", "success", "liked", tr.liked, "likeCount", tr.likeCount));
    }

    // @PostMapping("/participate")
    // public String participateFunding(
    // @RequestParam("fundingId") Long fundingId,
    // @RequestParam("givePrice") Integer givePrice,
    // HttpSession session) {
    //
    // Long userId = (Long) session.getAttribute("userId");
    // if (userId == null) {
    // return "redirect:/user/sign-in-view";
    // }
    //
    // fundingPriceBO.participateFunding(userId, fundingId, givePrice);
    //
    // session.setAttribute("participationUserId", userId);
    // session.setAttribute("participationFundingId", fundingId);
    // session.setAttribute("participationGivePrice", givePrice);
    //
    // return "redirect:/funding/participate-complete";
    // }

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

    /** React 상세 API: /funding/react/detail/{id} */
    @GetMapping(value = "/react/detail/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> getDetail(@PathVariable Long id) {
        try {
            Funding f = fundingBO.getFundingById(id);

            if (f == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("result", "fail");
                err.put("error", "NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
            }

            // 1) 기본값 보정
            if (f.getCurrentPrice() == null) {
                f.setCurrentPrice(0);
            }
            if (f.getImagePath() == null || f.getImagePath().isBlank()) {
                f.setImagePath("/images/default-funding.png");
            }

            // 2) 이미지 경로를 풀 URL로 변환 (DB에는 /images/... 이 저장되어 있음)
            String path = f.getImagePath();
            if (path != null && !path.startsWith("http")) {
                if (!path.startsWith("/"))
                    path = "/" + path; // 안전 보정
                String base = ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .build()
                        .toUriString(); // 예: http://localhost (server.port=80)
                f.setImagePath(base + path); // 예: http://localhost/images/funding/xxx.png
            }

            Map<String, Object> ok = new HashMap<>();
            ok.put("result", "성공");
            ok.put("funding", f);
            return ResponseEntity.ok(ok);

        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("result", "fail");
            err.put("error", e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    /** 생성 */
    /** 생성 (React 전용, 기존 생성 로직 확장) */
    @PostMapping("/react/create")
    public ResponseEntity<?> createFundingForReact(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam("maxPrice") String maxPriceRaw,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "false") boolean isEmergency,
            @RequestParam(required = false) String endAt,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) String tags,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subImage", required = false) MultipartFile subImage,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result", "fail", "error", "로그인 필요"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("result", "fail", "error", "이미지 파일을 첨부해주세요."));
        }

        String norm = (maxPriceRaw == null ? "" : maxPriceRaw).replaceAll("[^0-9]", "");
        if (norm.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("result", "fail", "error", "목표 금액을 입력해주세요."));
        }
        int maxPrice = Integer.parseInt(norm);

        try {
            Funding f = new Funding();

            try {
                f.getClass().getMethod("setUserId", Long.class).invoke(f, userId);
            } catch (NoSuchMethodException ignore) {
                try {
                    f.getClass().getMethod("setUserId", Integer.class).invoke(f, userId.intValue());
                } catch (Exception ignore2) {}
            }

            f.setTitle(title == null ? "" : title);
            f.setDescription(description == null ? "" : description);
            f.setMaxPrice(maxPrice);
            f.setCurrentPrice(0);

            if (accountNumber != null) {
                try { f.getClass().getMethod("setAccountInfo", String.class).invoke(f, accountNumber); }
                catch (NoSuchMethodException ignore) {}
            }
            if (categoryId != null) {
                try { f.getClass().getMethod("setCategoryId", Long.class).invoke(f, categoryId); }
                catch (NoSuchMethodException ignore) {}
            }
            try { f.getClass().getMethod("setEmergency", Boolean.TYPE).invoke(f, isEmergency); }
            catch (NoSuchMethodException ignore) {}

            if (endAt != null && !endAt.isBlank()) {
                try { f.getClass().getMethod("setEndAt", String.class).invoke(f, endAt); }
                catch (NoSuchMethodException ignore) {}
            }
            if (minPrice != null) {
                try { f.getClass().getMethod("setMinPrice", Integer.TYPE).invoke(f, minPrice); }
                catch (NoSuchMethodException ignore) {}
            }
            if (tags != null) {
                try { f.getClass().getMethod("setTags", String.class).invoke(f, tags); }
                catch (NoSuchMethodException ignore) {}
            }

            try {
                if (f.getClass().getMethod("getStatus").invoke(f) == null)
                    f.getClass().getMethod("setStatus", String.class).invoke(f, "PENDING");
            } catch (NoSuchMethodException ignore) {}
            try {
                if (f.getClass().getMethod("getImagePath").invoke(f) == null)
                    f.getClass().getMethod("setImagePath", String.class).invoke(f, "");
            } catch (NoSuchMethodException ignore) {}
            try {
                f.getClass().getMethod("setSubImagePath", String.class).invoke(f, "");
            } catch (NoSuchMethodException ignore) {}

            // 🔥 여기만 수정한 부분
            Long fundingId = fundingBO.insertFunding(f, file, subImage);
            // (주의: BO의 insertFunding이 Long을 반환하도록 수정해야 함)

            return ResponseEntity.ok(Map.of("result", "success", "fundingId", fundingId));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "fail", "error", e.getMessage()));
        }
    }


    // 조회수 증가 API
    @PostMapping("/api/{id}/view")
    public ResponseEntity<?> increaseView(@PathVariable("id") Long fundingId) {
        try {
            fundingBO.increaseViewCount(fundingId); // BO -> Mapper.incrementViewCount()

            // 증가 후 최신 조회수를 내려주면 프론트에서 즉시 반영 가능
            Funding f = fundingBO.getFundingById(fundingId);
            Integer count = (f != null ? f.getViewCount() : null);

            return ResponseEntity.ok(Map.of(
                    "result", "success",
                    "viewCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "fail", "error", e.getMessage()));
        }
    }

    @GetMapping("/api/{fundingId}/like/state")
    public ResponseEntity<?> apiLikeState(@PathVariable Long fundingId, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        try {
            boolean liked = false;
            if (userId != null) {
                liked = fundingBO.isLiked(userId, fundingId);
            }
            int likeCount = fundingBO.likeCount(fundingId);
            return ResponseEntity.ok(Map.of(
                    "result", "success",
                    "liked", liked,
                    "likeCount", likeCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "fail", "error", e.getMessage()));
        }
    }

    /**
     * 펀딩 좋아요 토글 (API)
     * - 로그인 필요(미로그인: 401)
     * - 성공 시 liked/likeCount 반환
     */
    @PostMapping("/api/{fundingId}/like/toggle")
    public ResponseEntity<?> apiToggleLike(@PathVariable Long fundingId, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("result", "fail", "error", "로그인이 필요합니다."));
        }
        try {
            FundingBO.ToggleResult tr = fundingBO.toggleLike(userId, fundingId);
            return ResponseEntity.ok(Map.of(
                    "result", "success",
                    "liked", tr.liked,
                    "likeCount", tr.likeCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("result", "fail", "error", e.getMessage()));
        }
    }
}
