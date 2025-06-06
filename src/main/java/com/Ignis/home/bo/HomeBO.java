package com.Ignis.home.bo;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Ignis.home.donation.bo.DonationBO;
import com.Ignis.home.donation.domain.Donation;
import com.Ignis.home.funding.bo.FundingBO;
import com.Ignis.home.volunteer.bo.VolunteerBO;

@Service
public class HomeBO {

    @Autowired
    private DonationBO donationBO;

    @Autowired
    private VolunteerBO volunteerBO;

    @Autowired
    private FundingBO fundingBO;

    public List<Donation> getDonationProjects() {
        return donationBO.getLatestProjects(4);
    }

	/*
	 * public List<VolunteerProject> getVolunteerProjects() { return
	 * volunteerBO.getLatestProjects(4); }
	 * 
	 * public List<FundingProject> getFundingProjects() { return
	 * fundingBO.getLatestProjects(4); }
	 */
}
