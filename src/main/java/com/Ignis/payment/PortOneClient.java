package com.Ignis.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;


@Component
@RequiredArgsConstructor
public class PortOneClient {

    private static final Logger log = LoggerFactory.getLogger(PortOneClient.class);

    @Value("${portone.api-key}")
    private String apiKey;

    @Value("${portone.api-secret}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getAccessToken() {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("${")
                || apiSecret == null || apiSecret.isBlank() || apiSecret.startsWith("${")) {
            throw new IllegalStateException("PortOne API key/secret 미설정입니다. properties 또는 환경변수 확인!");
        }

        final String url = "https://api.iamport.kr/users/getToken";

        // application/x-www-form-urlencoded 로 전송
        org.springframework.util.LinkedMultiValueMap<String, String> form = new org.springframework.util.LinkedMultiValueMap<>();
        form.add("imp_key", apiKey);
        form.add("imp_secret", apiSecret);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> res = restTemplate.postForEntity(url, new HttpEntity<>(form, headers), Map.class);
            Map resp = res.getBody();
            if (resp == null) throw new IllegalStateException("PortOne 토큰 응답이 비었습니다.");

            int code = toInt(resp.get("code"), -999);
            if (code != 0) {
                Object msg = resp.get("message");
                throw new IllegalStateException("PortOne 토큰 발급 실패(code=" + code + ", message=" + msg + ")");
            }

            Map data = asMap(resp.get("response"));
            String token = data == null ? null : (String) data.get("access_token");
            if (token == null || token.isBlank()) {
                throw new IllegalStateException("PortOne 토큰이 없습니다: " + resp);
            }
            return token;
        } catch (RestClientResponseException e) {
            log.error("PortOne 토큰 발급 HTTP {}: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("PortOne 토큰 발급 HTTP 오류: " + e.getRawStatusCode(), e);
        }
    }

    public void prepare(String merchantUid, int amount) {
        String token = getAccessToken();

        final String url = "https://api.iamport.kr/payments/prepare";

        // DTO로 타입 고정 (amount는 무조건 Integer)
        class PreparePayload {
            public String merchant_uid;
            public Integer amount;
            PreparePayload(String mid, Integer amt) { this.merchant_uid = mid; this.amount = amt; }
        }
        PreparePayload payload = new PreparePayload(merchantUid, Integer.valueOf(amount));

        try {
            // 직접 JSON 문자열로 직렬화 (타입 보존)
            String json = objectMapper.writeValueAsString(payload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            if (log.isInfoEnabled()) {
                log.info("[PortOne prepare:request] {}", json); // 디버깅용: 실제 전송 JSON
            }

            ResponseEntity<Map> res = restTemplate.postForEntity(
                    url,
                    new HttpEntity<>(json, headers), // String 바디(JSON), 헤더는 application/json
                    Map.class
            );

            Map resp = res.getBody();
            if (resp == null) {
                throw new IllegalStateException("PortOne 사전등록 응답이 비었습니다.");
            }
            int code = toInt(resp.get("code"), -999);
            if (code != 0) {
                throw new IllegalStateException("사전등록 실패(code=" + code + ", message=" + resp.get("message") + ")");
            }
            if (log.isInfoEnabled()) {
                log.info("[PortOne prepare:response] {}", resp);
            }
        } catch (RestClientResponseException e) {
            log.error("PortOne 사전등록 HTTP {}: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("PortOne 사전등록 HTTP 오류: " + e.getRawStatusCode(), e);
        } catch (Exception e) {
            throw new IllegalStateException("PortOne 사전등록 처리 중 예외", e);
        }
    }

    public Map getPaymentByImpUid(String impUid) {
        String token = getAccessToken();
        final String url = "https://api.iamport.kr/payments/" + impUid;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        try {
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            Map resp = res.getBody();
            if (resp == null) throw new IllegalStateException("PortOne 결제조회 응답이 비었습니다.");

            int code = toInt(resp.get("code"), -999);
            if (code != 0) {
                throw new IllegalStateException("결제조회 실패(code=" + code + ", message=" + resp.get("message") + ")");
            }

            Map data = asMap(resp.get("response"));
            if (data == null) {
                throw new IllegalStateException("결제조회 응답에 response가 없습니다: " + resp);
            }
            return data;
        } catch (RestClientResponseException e) {
            log.error("PortOne 결제조회 HTTP {}: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("PortOne 결제조회 HTTP 오류: " + e.getRawStatusCode(), e);
        }
    }

    // --------- helpers ----------
    private static int toInt(Object obj, int def) {
        return (obj instanceof Number) ? ((Number) obj).intValue() : def;
    }
    @SuppressWarnings("unchecked")
    private static Map asMap(Object obj) {
        return (obj instanceof Map) ? (Map) obj : null;
    }

}
