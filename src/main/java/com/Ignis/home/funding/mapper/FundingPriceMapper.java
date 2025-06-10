package com.Ignis.home.funding.mapper;

import com.Ignis.home.funding.domain.FundingPrice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FundingPriceMapper {
    void insertFundingPrice(FundingPrice fundingPrice);
}
