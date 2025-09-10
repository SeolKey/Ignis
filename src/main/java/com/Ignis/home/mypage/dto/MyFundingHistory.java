package com.Ignis.home.mypage.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyFundingHistory {

    private Long fundingPriceId;
    private Long fundingId;
    private String title;
    private Integer amount;
    private String status;
    private LocalDateTime createdAt;
    private String impUid;
    private String merchantUid;
    private String receiptUrl;
}
