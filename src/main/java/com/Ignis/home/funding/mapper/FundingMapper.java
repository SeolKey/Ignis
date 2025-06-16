package com.Ignis.home.funding.mapper;

import java.util.List;

import com.Ignis.common.enums.Status;
import com.Ignis.home.donation.domain.Donation;
import org.apache.ibatis.annotations.Mapper;

import com.Ignis.home.funding.domain.Funding;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FundingMapper {
    List<Funding> selectFundingList();

    Funding selectFundingById(Long fundingId);

    void insertFunding(Funding funding);

    List<Funding> selectRecentFundingList(int limit);

    void updateCurrentPrice(@Param("fundingId") Long fundingId, @Param("amount") Integer amount);
    //관리자 기능
    List<Funding> selectPendingFundingList();
    void updateFundingStatus(@Param("fundingId") Long fundingId, @Param("status") String status);
    void deleteFunding(int fundingId);
}

