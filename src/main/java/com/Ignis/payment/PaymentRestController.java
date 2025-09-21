package com.Ignis.payment;

import com.Ignis.payment.PaymentBO.CompletedPayment;
import com.Ignis.payment.PaymentBO.PrepareResult;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentRestController {

    private final PaymentBO paymentBO;

    @PostMapping("/prepare")
    public ResponseEntity<PrepareResult> prepare(@RequestBody PrepareRequest req, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        String buyerName  = (String) session.getAttribute("userName");  // 없으면 null 허용
        String buyerEmail = (String) session.getAttribute("loginId");   // 이메일 세션명 다르면 교체
        String buyerTel   = null;

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        if (!"FUNDING".equalsIgnoreCase(req.getTargetType())) {
            return ResponseEntity.badRequest().build();
        }
        PrepareResult result = paymentBO.prepareFunding(userId, req.getTargetId(), req.getAmount(), buyerName, buyerEmail, buyerTel);
        return ResponseEntity.ok(result);
    }

    // (선택) 웹훅 엔드포인트 — 콘솔 등록 후 사용 가능
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody WebhookPayload payload) {
        try {
            if (payload.getImpUid() == null || payload.getMerchantUid() == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("result", "fail", "error", "imp_uid 또는 merchant_uid 누락")
                );
            }
            CompletedPayment done = paymentBO.completeFunding(payload.getImpUid(), payload.getMerchantUid());
            return ResponseEntity.ok(Map.of(
                    "result", "ok",
                    "fundingId", done.getFundingId(),
                    "amount", done.getAmount(),
                    "merchantUid", done.getMerchantUid(),
                    "impUid", done.getImpUid()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("result", "fail", "error", e.getMessage())
            );
        }
    }

    @Data
    public static class PrepareRequest {
        @NotNull
        private String targetType;  // "FUNDING"

        @NotNull
        private Long targetId;

        @NotNull
        @Min(1)
        private Integer amount;
    }

    @Data
    public static class WebhookPayload {
        @JsonProperty("imp_uid")
        private String impUid;
        @JsonProperty("merchant_uid")
        private String merchantUid;
        private String status;
    }
}
