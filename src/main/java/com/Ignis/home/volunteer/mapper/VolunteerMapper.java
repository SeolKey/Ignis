package com.Ignis.home.volunteer.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.Ignis.home.volunteer.domain.Volunteer;

@Mapper
public interface VolunteerMapper {

    // ✅ 승인된 봉사글 전체 조회
    List<Volunteer> selectVolunteerList();

    // ✅ 봉사글 단건 조회
    Volunteer selectVolunteerById(Long id);

    // ✅ 봉사글 등록
    int insertVolunteer(Volunteer volunteer);

    // ✅ 최신 봉사글 목록
    List<Volunteer> selectRecentVolunteerList(int limit);

    // ✅ 조회수 증가
    void incrementViewCount(Long volunteerId);

    // ✅ 인기순 목록
    List<Volunteer> selectMostViewedVolunteerList(int limit);

    // ✅ 참여자 수 증감
    int increaseCurrentPeople(@Param("volunteerId") Long volunteerId);
    int decreaseCurrentPeople(@Param("volunteerId") Long volunteerId);

    // ✅ 🔥 긴급 상태 토글 (admin 전용)
    void updateVolunteerEmergencyStatusAndTitle(Map<String, Object> params);

    // ✅ 긴급 상태 봉사글 조회용
    Volunteer selectEmergencyVolunteer();

    int incrementLikeCount(@Param("volunteerId") Long volunteerId);
    int decrementLikeCount(@Param("volunteerId") Long volunteerId);
    Integer selectLikeCount(@Param("volunteerId") Long volunteerId);

    int likeExists(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);
    int insertLike(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);
    int deleteLike(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);

}
