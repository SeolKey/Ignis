package com.Ignis.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class DonationPaymentRestController {
    private final DonationPaymentBO donationPaymentBO;

    /** 사전등록: merchant_uid 생성 + PortOne /prepare 호출 + READY행 insert */
    @PostMapping("/donation/prepare")
    public Map<String, Object> prepare(@RequestParam Long donationId,
                                       @RequestParam int amount,
                                       @RequestParam(required = false) String buyerName,
                                       @RequestParam(required = false) String buyerEmail,
                                       @RequestParam(required = false) String buyerTel,
                                       HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        try {
            Long userId = currentUserId(session);
            if (userId == null) {
                res.put("code", 401);
                res.put("error_message", "로그인이 필요합니다.");
                return res;
            }
            DonationPaymentBO.PrepareResult pr = donationPaymentBO.prepareDonation(
                    userId, donationId, amount, buyerName, buyerEmail, buyerTel
            );
            res.put("result", "success");
            res.put("merchantUid", pr.getMerchantUid());
            res.put("name", pr.getName());     // 결제창 표시용(기부 제목)
            res.put("amount", pr.getAmount());
            res.put("buyerName", pr.getBuyerName());
            res.put("buyerEmail", pr.getBuyerEmail());
            res.put("buyerTel", pr.getBuyerTel());
            return res;
        } catch (IllegalArgumentException e) {
            res.put("code", 400);
            res.put("error_message", e.getMessage());
            return res;
        } catch (IllegalStateException e) {
            res.put("code", 500);
            res.put("error_message", e.getMessage());
            return res;
        } catch (Exception e) {
            res.put("code", 500);
            res.put("error_message", "결제 사전등록 중 오류가 발생했습니다.");
            return res;
        }
    }

    /** 결제 완료 콜백/확인: imp_uid 검증 -> DB PAID 반영 -> 누적금액 증가 */
    @PostMapping("/donation/complete")
    public Map<String, Object> complete(@RequestParam String impUid,
                                        @RequestParam String merchantUid,
                                        @RequestParam Long donationId) {
        Map<String, Object> res = new HashMap<>();
        try {
            DonationPaymentBO.CompletedPayment done = donationPaymentBO.completeDonation(impUid, merchantUid, donationId);
            res.put("result", "success");
            res.put("donationId", done.getDonationId());
            res.put("amount", done.getAmount());
            res.put("impUid", done.getImpUid());
            res.put("merchantUid", done.getMerchantUid());
            return res;
        } catch (IllegalArgumentException e) {
            res.put("code", 400);
            res.put("error_message", e.getMessage());
            return res;
        } catch (IllegalStateException e) {
            res.put("code", 409); // 상태 불일치/중복 등
            res.put("error_message", e.getMessage());
            return res;
        } catch (Exception e) {
            res.put("code", 500);
            res.put("error_message", "결제 검증/반영 중 오류가 발생했습니다.");
            return res;
        }
    }

    /** 세션 userId 안전 추출 (userId / userID 모두 허용, Integer/Long 모두 허용) */
    private Long currentUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (id == null) id = session.getAttribute("userID");
        if (id instanceof Long) return (Long) id;
        if (id instanceof Integer) return ((Integer) id).longValue();
        return null;
    }
}
