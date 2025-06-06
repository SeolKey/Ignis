package com.Ignis.home.funding.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.common.FileManagerService;
import com.Ignis.home.funding.domain.Funding;
import com.Ignis.home.funding.mapper.FundingMapper;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class FundingBO {

    @Autowired
    private FundingMapper fundingMapper;
    
    @Autowired
    private FileManagerService fileManagerService;

    public List<Funding> getFundingList() {
        return fundingMapper.selectFundingList();
    }

    public Funding getFundingById(Long fundingId) {
        return fundingMapper.selectFundingById(fundingId);
    }

    public void insertFunding(Funding funding, MultipartFile file) {
    	String imagePath = fileManagerService.saveFile(file);
        funding.setImagePath(imagePath);
        fundingMapper.insertFunding(funding);
    }
    
    public List<Funding> getRecentFundingList(int limit) {
        return fundingMapper.selectRecentFundingList(limit);
    }
}
