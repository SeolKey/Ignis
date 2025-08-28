package com.Ignis.payment;

import com.Ignis.payment.PaymentBO.CompletedPayment;
import com.Ignis.payment.PaymentBO.PrepareResult;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 웹훅 엔드포인트 — 콘솔 등록 후 사용 가능
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody WebhookPayload payload) {
        // payload.imp_uid / merchant_uid 수신 → 서버 검증 재사용 가능
        return ResponseEntity.ok().build();
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
        private String imp_uid;
        private String merchant_uid;
        private String status;
    }
}
