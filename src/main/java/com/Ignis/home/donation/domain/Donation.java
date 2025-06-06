package com.Ignis.home.donation.domain;

import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@ToString
@Data
public class Donation {
    private Long donationId;
    private Long userId;
    private String title;
    private String description;
    private String accountInfo;
    private Integer maxPrice;
    private Integer currentPrice;
    private String status;         // PENDING / APPROVED / REJECTED
    private String rejectReason;
    private String imagePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
