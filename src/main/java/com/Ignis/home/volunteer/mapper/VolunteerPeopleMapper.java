package com.Ignis.home.volunteer.mapper;

import com.Ignis.home.volunteer.domain.VolunteerParticipant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.Ignis.home.volunteer.domain.VolunteerPeople;
import java.util.List;

@Mapper
public interface VolunteerPeopleMapper {
    Integer exists(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);
    int insert(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);
    int delete(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);
    List<VolunteerParticipant> selectParticipantsByVolunteerId(@Param("volunteerId") Long volunteerId);
}
