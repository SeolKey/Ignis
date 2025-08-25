package com.Ignis.home.volunteer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import com.Ignis.home.volunteer.bo.VolunteerBO;
import com.Ignis.home.volunteer.domain.Volunteer;
import com.Ignis.home.volunteer.mapper.VolunteerMapper;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/volunteer")
public class VolunteerRestController {

    @Autowired
    private VolunteerBO volunteerBO;
    private final VolunteerMapper volunteerMapper;

    public VolunteerRestController(VolunteerMapper volunteerMapper) {
        this.volunteerMapper = volunteerMapper;
    }

    @PostMapping("/create")
    public Map<String, Object> createVolunteer(
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime,
            @RequestParam("maxParticipants") int maxParticipants,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        int rowCount = volunteerBO.addVolunteer(
                userId, title, description, location, startTime, endTime, maxParticipants, imageFile);

        Map<String, Object> result = new HashMap<>();
        if (rowCount > 0) {
            result.put("code", 1);
            result.put("result", "성공");
        } else {
            result.put("code", 500);
            result.put("errorMessage", "DB 저장 실패");
        }
        return result;

    }

    // 목록
    @GetMapping("/react/list")
    @ResponseBody
    public Map<String, Object> apiVolunteerList() {
        // ① getVolunteerList() ② list() ③ selectLatest(int limit) 중 네 BO에 있는 걸 사용
        List<Volunteer> list = volunteerBO.getVolunteerList(); // ← 여길 너네 BO 실제 이름으로
        Map<String, Object> body = new HashMap<>();
        body.put("volunteerList", list != null ? list : Collections.emptyList());
        return body;
    }

    // 상세
    @GetMapping("/react/detail/{id}")
    @ResponseBody
    public ResponseEntity<?> apiVolunteerDetail(@PathVariable("id") Long id) {
        // ① getVolunteerById(id) ② findOne(id) ③ selectById(id)
        Volunteer v = volunteerBO.getVolunteerById(id); // ← 실제 이름으로
        if (v == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("result", "실패", "error", "NOT_FOUND"));
        }
        return ResponseEntity.ok(Map.of("result", "성공", "data", v));
    }

    // VolunteerRestController.java (교체본)
    @PostMapping(value = "/react/create", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            MediaType.MULTIPART_FORM_DATA_VALUE })
    @ResponseBody
    public ResponseEntity<?> apiVolunteerCreate(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam("startTime") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime,
            @RequestParam("maxParticipants") Integer maxParticipants,
            @RequestParam("imagePath") String imagePath, // 프론트에서 placeholder 전달 중
            @RequestParam(value = "currentPeople", required = false, defaultValue = "0") Integer currentPeople,
            HttpSession session) {
        try {
            Long userId = (Long) session.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("result", "실패", "error", "UNAUTHORIZED"));
            }

            // 필수값 간단 검증 (빈 문자열 방지)
            if (isBlank(title) || isBlank(description) || isBlank(location) || isBlank(imagePath)
                    || startTime == null || endTime == null || maxParticipants == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("result", "실패", "error", "필수 값 누락 또는 형식 오류"));
            }

            Volunteer v = new Volunteer();
            v.setUserId(userId);
            v.setTitle(title);
            v.setDescription(description);
            v.setLocation(location); // ✅ NOT NULL
            v.setImagePath(imagePath); // ✅ NOT NULL
            v.setStartTime(startTime); // ✅ NOT NULL
            v.setEndTime(endTime); // ✅ NOT NULL
            v.setMaxParticipants(maxParticipants); // ✅ NOT NULL
            v.setCurrentPeople(currentPeople != null ? currentPeople : 0); // ✅ NOT NULL
            v.setStatus("PENDING"); // DB 기본이지만 명시해도 OK
            v.setCreatedAt(LocalDateTime.now());
            v.setUpdatedAt(LocalDateTime.now());
            try {

            } catch (Throwable ignore) {
            } // 필드 있으면 0

            volunteerMapper.insertVolunteer(v); // ✅ Mapper가 #{location}, #{imagePath} 등 포함해야 함

            Long newId = null;
            try {
                newId = v.getVolunteerId();
            } catch (Throwable ignore) {
            }

            Map<String, Object> body = new HashMap<>();
            body.put("result", "성공");
            if (newId != null)
                body.put("id", newId); // null이면 넣지 않음

            return ResponseEntity.ok(body);

        } catch (org.springframework.dao.DataIntegrityViolationException die) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("result", "실패", "error", "데이터 제약 위반: " + die.getMostSpecificCause().getMessage()));
        } catch (Exception e) {
            String msg = e.getMessage();
            Map<String, Object> body = new HashMap<>();
            body.put("result", "실패");
            if (msg != null)
                body.put("error", msg);
            else
                body.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }

    

    }

    // 편의용 유틸 (클래스 안에 private로 추가)
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

}
