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

    /** 설정 페이지 접근 검증 타임스탬프 세션 키 */
    private static final String CONFIG_VERIFIED_AT = "CONFIG_VERIFIED_AT";
    /** 검증 유효 시간(5분) */
    private static final long VERIFY_WINDOW_MILLIS = 5 * 60 * 1000L;

    @GetMapping
    public String myPage(HttpSession session, Model model){
        String userName = (String) session.getAttribute("userName");
        model.addAttribute("userName", userName);
        return "mypage/myPage";
    }

    /** 세션에 저장된 userId/userID 어떤 형태든 Long으로 복구 */
    private Long currentUserId(HttpSession session) {
        Object id = session.getAttribute("userId");
        if (id == null) id = session.getAttribute("userID");
        if (id instanceof Long) return (Long) id;
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof String s && s.matches("\\d+")) return Long.parseLong(s);
        return null;
    }

    /** 설정 접근 검증 여부(최근 5분 이내) */
    private boolean isConfigVerified(HttpSession session){
        Object ts = session.getAttribute(CONFIG_VERIFIED_AT);
        if (!(ts instanceof Long)) return false;
        long t = (Long) ts;
        return System.currentTimeMillis() - t <= VERIFY_WINDOW_MILLIS;
    }

    /** 설정 페이지: 리다이렉트 없이 동일 뷰 반환, needVerify 플래그로 모달 제어 */
    @GetMapping("/config")
    public String myPageConfig(HttpSession session, Model model){
        String userName = (String) session.getAttribute("userName");
        model.addAttribute("userName", userName);
        model.addAttribute("needVerify", !isConfigVerified(session)); // true면 진입 시 모달 자동 오픈
        return "mypage/myPageConfig"; // ↔ templates/mypage/myPageConfig.html
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
