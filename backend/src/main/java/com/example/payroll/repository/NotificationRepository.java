package com.example.payroll.repository;

import com.example.payroll.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByTimestampDesc(String recipientId);
    long countByRecipientIdAndIsReadFalse(String recipientId);
}
