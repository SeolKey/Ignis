package com.Ignis.home.funding.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FundingPrice {
    private Long fundingPriceId;
    private Long fundingId;
    private Long userId;
    private Integer givePrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
