package com.Ignis.home.mypage.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyDonationHistory {
    private Long donationPriceId;
    private Long donationId;
    private String title;
    private Integer amount;
    private String status;
    private LocalDateTime createdAt;
    private String impUid;
    private String merchantUid;
    private String receiptUrl;
}
