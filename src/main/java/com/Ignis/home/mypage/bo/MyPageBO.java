package com.Ignis.home.mypage.bo;

import com.Ignis.home.mypage.dto.MyDonationHistory;
import com.Ignis.home.mypage.dto.MyFundingHistory;
import com.Ignis.home.mypage.dto.MyPageSummary;
import com.Ignis.home.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MyPageBO {
    private final MyPageMapper myPageMapper;

    public MyPageSummary getSummary(Long userId) {
        return myPageMapper.selectSummary(userId);
    }

    public List<MyDonationHistory> getDonationHistory(Long userId, boolean onlyPaid) {
        return myPageMapper.selectDonationHistory(userId, onlyPaid);
    }

    public List<MyFundingHistory> getFundingHistory(Long userId, boolean onlyPaid) {
        return myPageMapper.selectFundingHistory(userId, onlyPaid);
    }
}
