package com.Ignis.home.funding.domain;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class Funding {
    private Long fundingId;
    private Long userId;
    private String title;
    private String description;
    private Integer maxPrice;
    private Integer currentPrice;
    private String imagePath;
    private String status;         // PENDING / APPROVED / REJECTED
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;
    private boolean emergency;
}