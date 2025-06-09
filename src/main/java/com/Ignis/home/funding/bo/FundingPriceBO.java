package com.Ignis.home.funding.bo;


import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.funding.domain.FundingPrice;
import com.Ignis.home.funding.mapper.FundingMapper;
import com.Ignis.home.funding.mapper.FundingPriceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FundingPriceBO {

    @Autowired
    private FundingPriceMapper fundingPriceMapper;

    @Autowired
    private FundingMapper fundingMapper;

    public void participateFunding(Long userId, Long fundingId, Integer givePrice) {
        FundingPrice fundingPrice = new FundingPrice();
        fundingPrice.setUserId(userId);
        fundingPrice.setFundingId(fundingId);
        fundingPrice.setGivePrice(givePrice);
        fundingPriceMapper.insertFundingPrice(fundingPrice);

        fundingMapper.updateCurrentPrice(fundingId, givePrice);
    }
}
