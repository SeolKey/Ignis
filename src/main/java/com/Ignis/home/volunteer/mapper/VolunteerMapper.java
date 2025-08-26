package com.Ignis.home.volunteer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.Ignis.home.volunteer.domain.Volunteer;

@Mapper
public interface VolunteerMapper {
    List<Volunteer> selectVolunteerList();
    
    Volunteer selectVolunteerById(Long id);
    
    int insertVolunteer(Volunteer volunteer);
    
    List<Volunteer> selectRecentVolunteerList(int limit);

    void incrementViewCount(Long volunteerId);
    List<Volunteer> selectMostViewedVolunteerList(int limit);
}