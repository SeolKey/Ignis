package com.Ignis.home.mypage;

import com.Ignis.home.mypage.bo.MyPageBO;
import com.Ignis.home.mypage.dto.MyDonationHistory;
import com.Ignis.home.mypage.dto.MyFundingHistory;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageBO myPageBO;

    @GetMapping
    public String myPage(HttpSession session, Model model){
        String userName = (String) session.getAttribute("userName");
        model.addAttribute("userName", userName);
        return "mypage/myPage";
    }
    private Long currentUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (id == null) id = session.getAttribute("userID");
        if (id instanceof Long) return (Long) id;
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof String s && s.matches("\\d+")) return Long.parseLong(s);
        return null;
    }

    @ResponseBody
    @GetMapping(value="/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> summary(HttpSession session) {
        Long userId = currentUserId(session);
        if (userId == null) {
            Map<String,Object> err = new HashMap<>();
            err.put("code", 401);
            err.put("error_message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(err);
        }
        return ResponseEntity.ok(myPageBO.getSummary(userId));
    }

    @ResponseBody
    @GetMapping(value="/donations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> donations(@RequestParam(defaultValue = "true") boolean onlyPaid,
                                       HttpSession session) {
        Long userId = currentUserId(session);
        if (userId == null) {
            Map<String,Object> err = new HashMap<>();
            err.put("code", 401);
            err.put("error_message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(err);
        }
        List<MyDonationHistory> list = myPageBO.getDonationHistory(userId, onlyPaid);
        return ResponseEntity.ok(list);
    }

    @ResponseBody
    @GetMapping(value="/fundings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> fundings(@RequestParam(defaultValue = "true") boolean onlyPaid,
                                      HttpSession session) {
        Long userId = currentUserId(session);
        if (userId == null) {
            Map<String,Object> err = new HashMap<>();
            err.put("code", 401);
            err.put("error_message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(err);
        }
        List<MyFundingHistory> list = myPageBO.getFundingHistory(userId, onlyPaid);
        return ResponseEntity.ok(list);
    }
}
