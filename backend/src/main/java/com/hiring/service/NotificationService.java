package com.hiring.service;

import com.hiring.model.*;
import com.hiring.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void createAndSendNotification(User user, String title, String content, String emailSubject, String emailBodyHtml) {
        // 1. Save in db
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type("EMAIL")
                .read(false)
                .build();
        notificationRepository.save(notification);

        // 2. Dispatch email
        emailService.sendEmail(user.getEmail(), emailSubject, emailBodyHtml);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    // ----------------------------------------------------
    // Styled Email Template Generators
    // ----------------------------------------------------

    private String getHeaderTemplate(String title) {
        return "<!DOCTYPE html><html><head><meta charset='utf-8'></head>" +
               "<body style='font-family: Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 20px;'>" +
               "<div style='max-width: 600px; margin: 0 auto; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden;'>" +
               "<div style='background: linear-gradient(135deg, #1f6feb, #4c2f96); padding: 30px; text-align: center;'>" +
               "<h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;'>" + title + "</h1>" +
               "</div>" +
               "<div style='padding: 30px; line-height: 1.6;'>";
    }

    private String getFooterTemplate() {
        return "</div>" +
               "<div style='background: #0d1117; padding: 20px; text-align: center; border-top: 1px solid #30363d; font-size: 12px; color: #8b949e;'>" +
               "<p style='margin: 0;'>AI-Powered Hiring & Assessment Platform</p>" +
               "<p style='margin: 5px 0 0 0;'>This is an automated notification, please do not reply directly.</p>" +
               "</div></div></body></html>";
    }

    public void sendRegistrationAlert(User user) {
        String title = "Welcome to Famehub!";
        String content = "Thank you for registering at Famehub. Your account is active. Please complete your profile and upload your resume.";

        String emailBody = getHeaderTemplate("Account Activated") +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>Your profile is officially registered on Famehub - the AI-Powered Recruitment & Assessment platform.</p>" +
                "<p>Start your career search today by completing your candidate profile, uploading your resume, and taking skill assessments.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='http://localhost/login' style='background: #1f6feb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Go to Dashboard</a>" +
                "</div>" +
                getFooterTemplate();

        createAndSendNotification(user, title, content, "Welcome to Famehub - Account Registered Successfully", emailBody);
    }

    public void sendJobApplicationAlert(Application app) {
        User user = app.getCandidate();
        Job job = app.getJob();
        String title = "Applied successfully: " + job.getTitle();
        String content = "Your job application for " + job.getTitle() + " has been received. Status: " + app.getStatus();

        String emailBody = getHeaderTemplate("Application Received") +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>We have successfully received your application for the position of <b>" + job.getTitle() + "</b> in the department of <b>" + 
                (job.getDepartment() != null ? job.getDepartment().getName() : "Engineering") + "</b>.</p>" +
                "<p>Our recruitment team is reviewing your profile. You can track your application pipeline progress anytime on your Candidate dashboard.</p>" +
                getFooterTemplate();

        createAndSendNotification(user, title, content, "Application Submitted: " + job.getTitle(), emailBody);
    }

    public void sendStatusChangeAlert(Application app) {
        User user = app.getCandidate();
        Job job = app.getJob();
        String status = app.getStatus();

        String title = "Application Update: " + job.getTitle();
        String content = "Your application status for " + job.getTitle() + " has changed to: " + status;

        String subject = "Status Update for Job: " + job.getTitle();
        String body = "";

        switch (status.toUpperCase()) {
            case "ASSESSMENT":
                body = getHeaderTemplate("Skills Assessment Invitation") +
                        "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                        "<p>Great news! The hiring team has advanced your application for <b>" + job.getTitle() + "</b> to the skill assessment round.</p>" +
                        "<p>Please log in to your Candidate Dashboard. You will find pending MCQ and Coding challenges matching this opening.</p>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='http://localhost/assessments' style='background: #1f6feb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Start Assessments Now</a>" +
                        "</div>" +
                        getFooterTemplate();
                break;
            case "INTERVIEW":
                body = getHeaderTemplate("Interview Scheduling") +
                        "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                        "<p>We would love to invite you for a video interview for the <b>" + job.getTitle() + "</b> role.</p>" +
                        "<p>Our recruiter will schedule the date and send you a link to our embedded Video Room. Please check your notifications frequently.</p>" +
                        getFooterTemplate();
                break;
            case "OFFERED":
                body = getHeaderTemplate("Congratulations! Job Offer") +
                        "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                        "<p>We are absolutely thrilled to offer you the position of <b>" + job.getTitle() + "</b>!</p>" +
                        "<p>Our HR representative will follow up shortly with full contract details, salary structures, and onboarding schedules.</p>" +
                        "<p>Welcome to the team!</p>" +
                        getFooterTemplate();
                break;
            case "REJECTED":
                body = getHeaderTemplate("Application Status Update") +
                        "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                        "<p>Thank you for taking the time to apply for the position of <b>" + job.getTitle() + "</b>.</p>" +
                        "<p>After reviewing all candidates and assessment scores, we regret to inform you that we are moving forward with other applicants at this time.</p>" +
                        "<p>We appreciate your interest in our company and wish you the best in your career pursuits.</p>" +
                        getFooterTemplate();
                break;
            default:
                body = getHeaderTemplate("Application Status Update") +
                        "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                        "<p>Your application status for <b>" + job.getTitle() + "</b> has been updated to: <b>" + status + "</b>.</p>" +
                        getFooterTemplate();
                break;
        }

        createAndSendNotification(user, title, content, subject, body);
    }

    public void sendInterviewScheduleAlert(Interview interview) {
        User user = interview.getApplication().getCandidate();
        Job job = interview.getApplication().getJob();
        String title = "Interview Scheduled: " + job.getTitle();
        String content = "Your interview is scheduled at " + interview.getScheduleTime() + ". Room ID: " + interview.getMeetingRoomId();

        String emailBody = getHeaderTemplate("Interview Invitation") +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>An interview has been scheduled for your application to the position of <b>" + job.getTitle() + "</b>.</p>" +
                "<p><b>Scheduled Date/Time:</b> " + interview.getScheduleTime() + "</p>" +
                "<p><b>Recruiter:</b> " + interview.getRecruiter().getName() + "</p>" +
                "<p>Please log in at the scheduled time, navigate to your Interview room, and join the video link.</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='http://localhost/interview/" + interview.getMeetingRoomId() + "' style='background: #238636; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Join Video Room</a>" +
                "</div>" +
                getFooterTemplate();

        createAndSendNotification(user, title, content, "Interview Invitation: " + job.getTitle(), emailBody);
    }

    public void sendAssessmentResultAlert(Submission submission, boolean passed) {
        User user = submission.getCandidate();
        Assessment assessment = submission.getAssessment();
        String title = "Assessment Graded: " + assessment.getTitle();
        String content = "You scored " + submission.getScore() + "% on assessment: " + assessment.getTitle();

        String resultText = passed ? 
                "<span style='color: #238636; font-weight: bold;'>PASSED</span>" : 
                "<span style='color: #f85149; font-weight: bold;'>FAILED</span>";

        String emailBody = getHeaderTemplate("Assessment Results") +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>Your MCQ skills assessment for <b>" + assessment.getTitle() + "</b> has been reviewed.</p>" +
                "<table style='width: 100%; border-collapse: collapse; margin: 20px 0; background: #0d1117; color: #ffffff;'>" +
                "<tr><td style='padding: 10px; border: 1px solid #30363d;'><b>Score Achieved:</b></td><td style='padding: 10px; border: 1px solid #30363d;'>" + submission.getScore() + "%</td></tr>" +
                "<tr><td style='padding: 10px; border: 1px solid #30363d;'><b>Passing Score:</b></td><td style='padding: 10px; border: 1px solid #30363d;'>" + assessment.getPassingScore() + "%</td></tr>" +
                "<tr><td style='padding: 10px; border: 1px solid #30363d;'><b>Result Status:</b></td><td style='padding: 10px; border: 1px solid #30363d;'>" + resultText + "</td></tr>" +
                "</table>" +
                (passed ?
                    "<p>Congratulations! Your score qualifies you for the next stage of the hiring process. Our recruiters will follow up shortly to schedule your interview.</p>" :
                    "<p>Thank you for completing the assessment. Unfortunately your score did not meet the passing threshold for this position. We encourage you to explore other openings on Famehub.</p>"
                ) +
                getFooterTemplate();

        createAndSendNotification(user, title, content, "Assessment Results: " + assessment.getTitle(), emailBody);
    }

    public void sendCodingResultAlert(User user, String challengeTitle, int passedCases, int totalCases, boolean passed) {
        String title = "Coding Challenge Evaluated: " + challengeTitle;
        String content = "Your coding submission for '" + challengeTitle + "' passed " + passedCases + "/" + totalCases + " test cases.";

        String resultText = passed ?
                "<span style='color: #238636; font-weight: bold;'>ACCEPTED</span>" :
                "<span style='color: #f85149; font-weight: bold;'>FAILED</span>";

        String emailBody = getHeaderTemplate("Coding Challenge Results") +
                "<p>Hi <b>" + user.getName() + "</b>,</p>" +
                "<p>Your coding challenge submission for <b>" + challengeTitle + "</b> has been evaluated by our automated judge.</p>" +
                "<table style='width: 100%; border-collapse: collapse; margin: 20px 0; background: #0d1117; color: #ffffff;'>" +
                "<tr><td style='padding: 10px; border: 1px solid #30363d;'><b>Test Cases Passed:</b></td><td style='padding: 10px; border: 1px solid #30363d;'>" + passedCases + " / " + totalCases + "</td></tr>" +
                "<tr><td style='padding: 10px; border: 1px solid #30363d;'><b>Result Status:</b></td><td style='padding: 10px; border: 1px solid #30363d;'>" + resultText + "</td></tr>" +
                "</table>" +
                (passed ?
                    "<p>Excellent work! Your solution passed all test cases. Our recruiters will review your code quality and be in touch to schedule your interview.</p>" :
                    "<p>Thank you for attempting the coding challenge. Unfortunately, your solution did not pass all required test cases for this position. Keep practising and explore other openings on Famehub!</p>"
                ) +
                getFooterTemplate();

        createAndSendNotification(user, title, content, "Coding Challenge Results: " + challengeTitle, emailBody);
    }
}

