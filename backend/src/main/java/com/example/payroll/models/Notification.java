package com.example.payroll.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientId; // User ID or Employee ID
    private String message;
    private NotificationType type;
    private LocalDateTime timestamp;
    private boolean isRead = false;

    public enum NotificationType {
        INFO, SUCCESS, WARNING, ERROR
    }

    public Notification() {}

    public Notification(String recipientId, String message, NotificationType type) {
        this.recipientId = recipientId;
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
