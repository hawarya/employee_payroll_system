package com.example.payroll.service;

import com.example.payroll.models.Notification;
import com.example.payroll.models.Notification.NotificationType;
import com.example.payroll.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /** Create and save a new notification */
    public Notification createNotification(String recipientId, String message, NotificationType type) {
        Notification notification = new Notification(recipientId, message, type);
        return notificationRepository.save(notification);
    }

    /** Get notifications for a specific user */
    public List<Notification> getNotificationsForUser(String recipientId) {
        return notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
    }

    /** Mark a numeric notification as read */
    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    /** Mark all notifications as read for a user */
    public void markAllAsRead(String recipientId) {
        List<Notification> unread = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        unread.stream().filter(n -> !n.isRead()).forEach(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    /** Clear all notifications for a user */
    public void clearAll(String recipientId) {
        List<Notification> all = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        notificationRepository.deleteAll(all);
    }

    /** Count unread notifications */
    public long countUnread(String recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }
}
