package com.Ignis.home.funding.domain;

import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@ToString
public class FundingPrice {
    private Long fundingPriceId;
    private Long fundingId;
    private Long userId;
    private Integer givePrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 결제 메타데이터
    private String impUid;        // 포트원 결제 고유번호
    private String merchantUid;   // 우리 주문번호
    private String pgProvider;    // html5_inicis 등
    private String pgTid;         // PG 원거래번호
    private String payMethod;     // card, vbank ...
    private String currency;      // KRW
    private String status;        // READY, PAID, CANCELLED, FAILED
    private String receiptUrl;    // 영수증 URL
    private LocalDateTime paidAt;
}
