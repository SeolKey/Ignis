package com.Ignis.home.funding.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.Ignis.home.funding.domain.Funding;

@Mapper
public interface FundingMapper {

    List<Funding> selectFundingList(); // 승인된 목록

    Funding selectFundingById(Long fundingId);

    void insertFunding(Funding funding);

    List<Funding> selectRecentFundingList(int limit);

    void updateCurrentPrice(@Param("fundingId") Long fundingId,
                            @Param("amount") Integer amount);

    List<Funding> selectPendingFundingList();

    void updateFundingStatus(@Param("fundingId") Long fundingId,
                             @Param("status") String status,
                             @Param("rejectReason") String rejectReason);

    void deleteFunding(int fundingId);

    void incrementViewCount(Long fundingId);

    List<Funding> selectMostViewedFundingList(int limit);

    void updateFundingEmergencyStatusAndTitle(Map<String, Object> params);

    // ✅ 긴급 펀딩글 1개 조회
    Funding selectEmergencyFunding();

    int incrementLikeCount(@Param("fundingId") Long fundingId);
    int decrementLikeCount(@Param("fundingId") Long fundingId);
    Integer selectLikeCount(@Param("fundingId") Long fundingId);

    int likeExists(@Param("fundingId") Long fundingId, @Param("userId") Long userId);
    int insertLike(@Param("fundingId") Long fundingId, @Param("userId") Long userId);
    int deleteLike(@Param("fundingId") Long fundingId, @Param("userId") Long userId);
}
