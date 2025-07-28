package com.Ignis.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class SecurityUtil {
    public static String sha256(String input) {
        try{
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02X", b & 0xff));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e){
            throw new RuntimeException("SHA-256을 찾을 수 없습니다.");
        }
    }
}
