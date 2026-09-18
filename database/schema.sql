-- Database Schema for AI-Powered Hiring & Assessment Platform

CREATE DATABASE IF NOT EXISTS hiring_db;
USE hiring_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary_range VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Contract, Internship
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_job_status (status),
    INDEX idx_job_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resume_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    resume_id BIGINT,
    status VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, SCREENING, ASSESSMENT, INTERVIEW, OFFERED, REJECTED, ARCHIVED
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
    UNIQUE KEY uq_job_candidate (job_id, candidate_id),
    INDEX idx_app_status (status),
    INDEX idx_app_job (job_id),
    INDEX idx_app_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Assessments Table (MCQ Tests)
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    passing_score DOUBLE NOT NULL DEFAULT 50.0,
    negative_marking_factor DOUBLE DEFAULT 0.0, -- e.g., 0.25 deduct per wrong answer, 0 for none
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DRAFT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_assess_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. MCQ Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    points INT DEFAULT 1,
    type VARCHAR(50) NOT NULL, -- SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. MCQ Options Table
CREATE TABLE IF NOT EXISTS options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Submissions Table (MCQ Candidate submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    score DOUBLE DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'STARTED', -- STARTED, COMPLETED
    tab_switches INT DEFAULT 0,
    copy_paste_detects INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_candidate_assessment (candidate_id, assessment_id),
    INDEX idx_submission_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Coding Questions Table
CREATE TABLE IF NOT EXISTS coding_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    constraints TEXT,
    difficulty VARCHAR(50) DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    template_java TEXT,
    template_python TEXT,
    template_cpp TEXT,
    template_js TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_coding_q_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Test Cases Table (For coding assessments)
CREATE TABLE IF NOT EXISTS test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_question_id BIGINT NOT NULL,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Coding Submissions Table
CREATE TABLE IF NOT EXISTS coding_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_question_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    source_code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL, -- java, python, cpp, javascript
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, COMPILATION_ERROR
    score DOUBLE DEFAULT 0.0,
    execution_time DOUBLE DEFAULT 0.0, -- In seconds
    memory_usage BIGINT DEFAULT 0, -- In KB
    token VARCHAR(255), -- Judge0 submission token
    error_message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coding_question_id) REFERENCES coding_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_coding_sub_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    schedule_time DATETIME NOT NULL,
    meeting_room_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_interview_schedule (schedule_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Interview Feedback Table
CREATE TABLE IF NOT EXISTS interview_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT NOT NULL,
    recommendation VARCHAR(50) NOT NULL, -- HIRE, REJECT, DEFER
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'EMAIL', -- EMAIL, APP, BOTH
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
