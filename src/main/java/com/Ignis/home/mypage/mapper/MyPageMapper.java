package com.Ignis.home.mypage.mapper;


import com.Ignis.home.mypage.dto.MyDonationHistory;
import com.Ignis.home.mypage.dto.MyFundingHistory;
import com.Ignis.home.mypage.dto.MyPageSummary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageMapper {
    int countVolunteerParticipation(@Param("userId") Long userId);

    List<MyDonationHistory> selectDonationHistory(@Param("userId") Long userId,
                                                  @Param("onlyPaid") boolean onlyPaid);
    Integer sumDonationAmount(@Param("userId") Long userId, @Param("onlyPaid") boolean onlyPaid);
    Integer countDonation(@Param("userId") Long userId, @Param("onlyPaid") boolean onlyPaid);

    List<MyFundingHistory> selectFundingHistory(@Param("userId") Long userId,
                                                @Param("onlyPaid") boolean onlyPaid);
    Integer sumFundingAmount(@Param("userId") Long userId, @Param("onlyPaid") boolean onlyPaid);
    Integer countFunding(@Param("userId") Long userId, @Param("onlyPaid") boolean onlyPaid);

    MyPageSummary selectSummary(@Param("userId") Long userId);
}
