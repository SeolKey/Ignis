package com.Ignis.admin;

import java.util.*;
import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.post.bo.PostBO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminRestController {

    private final PostBO postBO;
    private final DonationBO donationBO;
    private final FundingBO fundingBO;
    private final VolunteerBO volunteerBO;

    // 게시글 삭제
    @DeleteMapping("/delete-post/{id}")
    public Map<String, Object> deletePost(@PathVariable int id) {
        postBO.deletePostById(id);
        return Map.of("result", "삭제 완료");
    }

    // 기부 상태 변경
    @PostMapping("/donation-status-update")
    public String updateDonationStatus(@RequestParam("donationId") Long donationId,
                                       @RequestParam("status") Status status) {
        donationBO.updateDonationStatus(donationId, status);
        return "상태 변경 완료";
    }

    // 펀딩 상태 변경
    @PostMapping("/funding-status-update")
    public String updateFundingStatus(@RequestParam("fundingId") Long fundingId,
                                      @RequestParam("status") Status status,
                                      @RequestParam(value = "rejectReason", required = false) String rejectReason) {
        fundingBO.updateFundingStatus(fundingId, status, rejectReason);
        return "상태 변경 완료";
    }

    // ✅ 봉사 상태 변경 (추가)
    @PostMapping("/volunteer-status-update")
    public String updateVolunteerStatus(@RequestParam("volunteerId") Long volunteerId,
                                        @RequestParam("status") Status status,
                                        @RequestParam(value = "rejectReason", required = false) String rejectReason) {
        volunteerBO.updateVolunteerStatus(volunteerId, status.name(), rejectReason);
        return "상태 변경 완료";
    }

    // 긴급 토글
    @PostMapping("/donation-toggle-emergency/{donationId}")
    public String toggleDonationEmergency(@PathVariable Long donationId,
                                          @RequestParam("emergency") boolean isEmergency) {
        donationBO.toggleEmergency(donationId, isEmergency);
        return "긴급 상태 변경 완료";
    }

    @PostMapping("/funding-toggle-emergency/{fundingId}")
    public String toggleFundingEmergency(@PathVariable Long fundingId,
                                         @RequestParam("emergency") boolean isEmergency) {
        fundingBO.toggleEmergency(fundingId, isEmergency);
        return "긴급 상태 변경 완료";
    }

    @PostMapping("/volunteer-toggle-emergency/{volunteerId}")
    public String toggleVolunteerEmergency(@PathVariable Long volunteerId,
                                           @RequestParam("emergency") boolean isEmergency) {
        volunteerBO.toggleEmergency(volunteerId, isEmergency);
        return "긴급 상태 변경 완료";
    }

    // ✅ 긴급 배너 확인 (기존 그대로)
    @GetMapping("/api/emergency/check")
    public Map<String, Object> checkEmergency() {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            List<?> donationList  = toList(donationBO.getDonationList());
            List<?> fundingList   = toList(fundingBO.getFundingList());
            List<?> volunteerList = toList(volunteerBO.getVolunteerList());

            Optional<?> emgDonation  = pickLatestEmergency(donationList,  "getIsEmergency", "isEmergency", "getUpdatedAt", "getCreatedAt");
            Optional<?> emgFunding   = pickLatestEmergency(fundingList,   "getIsEmergency", "isEmergency", "getUpdatedAt", "getCreatedAt");
            Optional<?> emgVolunteer = pickLatestEmergency(volunteerList, "getIsEmergency", "isEmergency", "getUpdatedAt", "getCreatedAt");

            if (emgDonation.isPresent()) {
                Object d = emgDonation.get();
                result.put("isActive", true);
                result.put("type", "emergency");
                result.put("title", "[긴급] " + safeStr(invoke(d, "getTitle"), "재난 모금"));
                result.put("desc", "가장 시급한 도움의 손길이 필요합니다.");
                result.put("imagePath", safeStr(invoke(d, "getImagePath"), null));
                result.put("ctaText", "긴급 모금 참여");
                result.put("ctaHref", "/donation-detail/" + safeStr(invoke(d, "getDonationId"), ""));
                result.put("severity", "red");
                result.put("ribbon", "긴급");
                return result;
            }
            if (emgFunding.isPresent()) {
                Object f = emgFunding.get();
                result.put("isActive", true);
                result.put("type", "emergency");
                result.put("title", "[긴급] " + safeStr(invoke(f, "getTitle"), "긴급 펀딩"));
                result.put("desc", "지금 바로 참여해주세요.");
                result.put("imagePath", safeStr(invoke(f, "getImagePath"), null));
                result.put("ctaText", "펀딩 바로가기");
                result.put("ctaHref", "/funding/" + safeStr(invoke(f, "getFundingId"), ""));
                result.put("severity", "orange");
                result.put("ribbon", "긴급");
                return result;
            }
            if (emgVolunteer.isPresent()) {
                Object v = emgVolunteer.get();
                result.put("isActive", true);
                result.put("type", "emergency");
                result.put("title", "[긴급] " + safeStr(invoke(v, "getTitle"), "긴급 봉사"));
                result.put("desc", "현장에 인력이 필요합니다.");
                result.put("imagePath", safeStr(invoke(v, "getImagePath"), null));
                result.put("ctaText", "봉사 참여하기");
                result.put("ctaHref", "/volunteer/" + safeStr(invoke(v, "getVolunteerId"), ""));
                result.put("severity", "yellow");
                result.put("ribbon", "긴급");
                return result;
            }

            result.put("isActive", false);
            result.put("type", "none");
        } catch (Exception e) {
            result.put("isActive", false);
            result.put("type", "none");
            result.put("error", e.getMessage());
        }
        return result;
    }

    // ---------------------- Helper ----------------------
    @SuppressWarnings("unchecked")
    private List<?> toList(Object maybeList) {
        if (maybeList instanceof List) return (List<?>) maybeList;
        return Collections.emptyList();
    }

    private Optional<?> pickLatestEmergency(List<?> list,
                                            String isEmergencyGetter, String isEmergencyBool,
                                            String updatedGetter, String createdGetter) {
        if (list == null) return Optional.empty();
        return list.stream()
                .filter(o -> isEmergency(o, isEmergencyGetter, isEmergencyBool))
                .sorted((a, b) -> compareUpdatedThenCreatedDesc(a, b, updatedGetter, createdGetter))
                .findFirst();
    }

    private boolean isEmergency(Object o, String intGetter, String boolGetter) {
        Object v1 = invoke(o, intGetter);
        if (v1 instanceof Number) return ((Number) v1).intValue() == 1;
        Object v2 = invoke(o, boolGetter);
        if (v2 instanceof Boolean) return (Boolean) v2;
        return false;
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    private int compareUpdatedThenCreatedDesc(Object a, Object b, String updatedGetter, String createdGetter) {
        Comparable ua = asComparable(invoke(a, updatedGetter));
        Comparable ub = asComparable(invoke(b, updatedGetter));
        int c = compareNullableDesc(ua, ub);
        if (c != 0) return c;
        Comparable ca = asComparable(invoke(a, createdGetter));
        Comparable cb = asComparable(invoke(b, createdGetter));
        return compareNullableDesc(ca, cb);
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    private int compareNullableDesc(Comparable a, Comparable b) {
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return -a.compareTo(b);
    }

    private Comparable<?> asComparable(Object o) {
        return (o instanceof Comparable) ? (Comparable<?>) o : null;
    }

    private Object invoke(Object target, String method) {
        if (target == null || method == null) return null;
        try {
            return target.getClass().getMethod(method).invoke(target);
        } catch (Exception e) {
            return null;
        }
    }

    private String safeStr(Object v, String defVal) {
        return (v == null) ? defVal : String.valueOf(v);
    }
}
