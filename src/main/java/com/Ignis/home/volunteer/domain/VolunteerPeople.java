package com.Ignis.home.volunteer.domain;

import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;

@ToString
@Data
public class VolunteerPeople {
    private Long volunteerPeopleId; // PK
    private Long volunteerId;       // FK -> volunteer.volunteer_id
    private Long userId;            // FK -> users.user_id
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
