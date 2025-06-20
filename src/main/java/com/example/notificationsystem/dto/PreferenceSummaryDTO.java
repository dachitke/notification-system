package com.example.notificationsystem.dto;

public class PreferenceSummaryDTO {
    private long emailOptedInCount;
    private long smsOptedInCount;
    private long promoOptedInCount;

    public PreferenceSummaryDTO(long emailOptedInCount, long smsOptedInCount, long promoOptedInCount) {
        this.emailOptedInCount = emailOptedInCount;
        this.smsOptedInCount = smsOptedInCount;
        this.promoOptedInCount = promoOptedInCount;
    }

    public long getEmailOptedInCount() {
        return emailOptedInCount;
    }

    public long getSmsOptedInCount() {
        return smsOptedInCount;
    }

    public long getPromoOptedInCount() {
        return promoOptedInCount;
    }
}
