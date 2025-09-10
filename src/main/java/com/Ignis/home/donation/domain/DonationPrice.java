package com.Ignis.home.donation.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DonationPrice {
    private Long donationPriceId;
    private Long donationId;
    private Long userId;
    private Integer givePrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 결제/영수증 필드
    private String impUid;
    private String merchantUid;
    private String pgProvider;
    private String pgTid;
    private String payMethod;
    private String currency;
    private String status;       // READY / PAID / CANCELLED / FAILED
    private String receiptUrl;
    private LocalDateTime paidAt;

}
