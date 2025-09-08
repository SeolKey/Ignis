package com.Ignis.home.volunteer.domain;

import lombok.Data;
import lombok.ToString;

@ToString
@Data
public class VolunteerParticipant {
    private String name;    // 이름
    private String phone;   // 전화번호 (user.phone_number)
    private String email;   // 이메일 (user.email)
}
