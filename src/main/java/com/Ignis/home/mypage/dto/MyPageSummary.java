package com.Ignis.home.mypage.dto;


import lombok.Data;

@Data
public class MyPageSummary {
    private Integer totalVolunteerParticipations;
    private Integer totalDonationAmount;
    private Integer totalDonationCount;
    private Integer totalFundingAmount;
    private Integer totalFundingCount;

    // 봉사 참여 + 펀딩 건수 + 기부 건수
    private Integer totalParticipations;
}
