package com.Ignis.home.volunteer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.Ignis.home.volunteer.domain.Volunteer;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface VolunteerMapper {
    List<Volunteer> selectVolunteerList();
    
    Volunteer selectVolunteerById(Long id);
    
    int insertVolunteer(Volunteer volunteer);
    
    List<Volunteer> selectRecentVolunteerList(int limit);

    void incrementViewCount(Long volunteerId);
    List<Volunteer> selectMostViewedVolunteerList(int limit);

    // ▼ 참여 증감용 추가
    int increaseCurrentPeople(@Param("volunteerId") Long volunteerId);
    int decreaseCurrentPeople(@Param("volunteerId") Long volunteerId);
}