package com.Ignis.donation.domain;

import com.Ignis.common.enums.Status;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@ToString
public class Donation {

    private int donationId;
    private Long userId;
    private String title;
    private String description;
    private String accountInfo;
    private int maxPrice;
    private int currentPrice;
    private Status status;
    private String imagePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
