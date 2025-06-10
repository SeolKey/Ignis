package com.Ignis.home.funding.mapper;

import java.util.List;

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
}
