package com.Ignis.home.volunteer.domain;

import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@ToString
@Data
public class Volunteer {
    private Long volunteerId;
    private Long userId;
    private String title;
    private String description;
    private String location;
    private String imagePath;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxParticipants;
    private String status; // 'PENDING', 'APPROVED', 'REJECTED'
    private String rejectReason;
    private Integer currentPeople;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer viewCount;
}
