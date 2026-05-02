package com.example.payroll.events;

import org.springframework.context.ApplicationEvent;

public class OtpEmailEvent extends ApplicationEvent {
    private final String email;
    private final String otp;
    private final OtpPurpose purpose;

    public OtpEmailEvent(Object source, String email, String otp, OtpPurpose purpose) {
        super(source);
        this.email = email;
        this.otp = otp;
        this.purpose = purpose;
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }
}
