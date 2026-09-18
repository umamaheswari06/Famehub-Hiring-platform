package com.hiring.controller;

import com.hiring.security.UserDetailsImpl;
import com.hiring.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for managing candidate and employee notification systems")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List all notifications for the authenticated user")
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId()));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark a notification message as read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read.");
    }
}
