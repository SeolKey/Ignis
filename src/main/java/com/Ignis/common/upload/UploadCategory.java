package com.Ignis.common.upload;

public enum UploadCategory {
    DONATION, FUNDING, VOLUNTEER, POST, NOTICE, USER, COMMON;

    public String dirName() {
        return name().toLowerCase();
    }
}
