package com.hiring.config;

import com.hiring.model.*;
import com.hiring.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing Seed Data...");

        // 1. Roles Seed
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));
        Role hrRole = roleRepository.findByName("ROLE_HR").orElseGet(() -> roleRepository.save(new Role(null, "ROLE_HR")));
        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE").orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CANDIDATE")));

        // 2. Users Seed
        User admin = null;
        if (!userRepository.existsByEmail("admin@famehub.com")) {
            admin = User.builder()
                    .name("Famehub Admin")
                    .email("admin@famehub.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .roles(Set.of(adminRole))
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created.");
        }

        User hr = null;
        if (!userRepository.existsByEmail("hr@famehub.com")) {
            hr = User.builder()
                    .name("Sarah Jenkins")
                    .email("hr@famehub.com")
                    .password(passwordEncoder.encode("hrpassword"))
                    .roles(Set.of(hrRole))
                    .active(true)
                    .build();
            hr = userRepository.save(hr);
            log.info("HR user created.");
        } else {
            hr = userRepository.findByEmail("hr@famehub.com").orElse(null);
        }

        User candidate = null;
        if (!userRepository.existsByEmail("candidate@famehub.com")) {
            candidate = User.builder()
                    .name("Alex River")
                    .email("candidate@famehub.com")
                    .password(passwordEncoder.encode("candidatepassword"))
                    .roles(Set.of(candidateRole))
                    .active(true)
                    .build();
            userRepository.save(candidate);
            log.info("Candidate user created.");
        }

        // 3. Departments Seed
        Department engDept = departmentRepository.findByName("Engineering").orElseGet(() -> departmentRepository.save(
                Department.builder().name("Engineering").description("Core Product Development & Ops").build()
        ));
        Department prodDept = departmentRepository.findByName("Product").orElseGet(() -> departmentRepository.save(
                Department.builder().name("Product").description("Product Management & UX Design").build()
        ));
        Department dataDept = departmentRepository.findByName("Data Science").orElseGet(() -> departmentRepository.save(
                Department.builder().name("Data Science").description("Data Analytics, ML & AI Research").build()
        ));
        Department mktDept = departmentRepository.findByName("Marketing").orElseGet(() -> departmentRepository.save(
                Department.builder().name("Marketing").description("Growth, Brand & Digital Marketing").build()
        ));
        Department designDept = departmentRepository.findByName("Design").orElseGet(() -> departmentRepository.save(
                Department.builder().name("Design").description("UI/UX Design & Creative").build()
        ));
        Department devopsDept = departmentRepository.findByName("DevOps").orElseGet(() -> departmentRepository.save(
                Department.builder().name("DevOps").description("Infrastructure, Cloud & Site Reliability").build()
        ));

        // 4. Jobs Seed
        if (jobRepository.findAll().isEmpty() && hr != null) {
            // Job 1 - Engineering
            Job devJob = Job.builder()
                    .title("Senior Java Software Engineer")
                    .description("Join our core product team building high-performance backend systems. Requires 5+ years Java, Spring Boot, MySQL, and microservices experience.")
                    .location("San Francisco, CA (Hybrid)")
                    .salaryRange("$140,000 - $170,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(engDept)
                    .createdBy(hr)
                    .build();
            devJob = jobRepository.save(devJob);

            // Job 2 - Engineering
            jobRepository.save(Job.builder()
                    .title("Frontend React Developer")
                    .description("Build modern, responsive web applications using React, TypeScript, and Next.js. You'll work closely with designers and backend engineers to deliver pixel-perfect user interfaces with great performance. 3+ years of professional React experience required.")
                    .location("New York, NY (On-site)")
                    .salaryRange("$120,000 - $150,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(engDept)
                    .createdBy(hr)
                    .build());

            // Job 3 - Data Science
            jobRepository.save(Job.builder()
                    .title("Machine Learning Engineer")
                    .description("Design and deploy production-grade ML models for our recommendation engine and fraud detection systems. Requires strong Python, TensorFlow/PyTorch, and experience with large-scale data pipelines. PhD or Master's in CS/ML preferred.")
                    .location("Remote (US)")
                    .salaryRange("$160,000 - $200,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(dataDept)
                    .createdBy(hr)
                    .build());

            // Job 4 - Product
            jobRepository.save(Job.builder()
                    .title("Senior Product Manager")
                    .description("Lead product strategy for our B2B SaaS platform serving 500+ enterprise clients. Define roadmaps, prioritize features, and collaborate cross-functionally with engineering, design, and sales. 5+ years PM experience in SaaS required.")
                    .location("Austin, TX (Hybrid)")
                    .salaryRange("$135,000 - $165,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(prodDept)
                    .createdBy(hr)
                    .build());

            // Job 5 - Design
            jobRepository.save(Job.builder()
                    .title("UI/UX Designer")
                    .description("Create intuitive, beautiful user experiences for our hiring platform. Conduct user research, build wireframes and prototypes in Figma, and work with developers to implement designs. Portfolio demonstrating strong visual design skills required.")
                    .location("San Francisco, CA (Hybrid)")
                    .salaryRange("$110,000 - $140,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(designDept)
                    .createdBy(hr)
                    .build());

            // Job 6 - DevOps
            jobRepository.save(Job.builder()
                    .title("Cloud Infrastructure Engineer")
                    .description("Architect and maintain cloud infrastructure on AWS/GCP. Implement CI/CD pipelines, container orchestration with Kubernetes, and infrastructure-as-code using Terraform. On-call rotation required. 4+ years DevOps/SRE experience.")
                    .location("Seattle, WA (On-site)")
                    .salaryRange("$145,000 - $180,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(devopsDept)
                    .createdBy(hr)
                    .build());

            // Job 7 - Marketing
            jobRepository.save(Job.builder()
                    .title("Digital Marketing Manager")
                    .description("Drive growth through SEO, SEM, content marketing, and social media campaigns. Manage a $2M+ annual marketing budget, analyze campaign performance with Google Analytics, and optimize conversion funnels. 4+ years B2B marketing experience.")
                    .location("Chicago, IL (Hybrid)")
                    .salaryRange("$95,000 - $125,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(mktDept)
                    .createdBy(hr)
                    .build());

            // Job 8 - Engineering (Part-time)
            jobRepository.save(Job.builder()
                    .title("Part-Time QA Automation Engineer")
                    .description("Write and maintain automated test suites using Selenium, Cypress, and JUnit. Work 20 hours/week on a flexible schedule. Perfect for experienced QA engineers looking for work-life balance. 2+ years automation testing experience.")
                    .location("Remote (US)")
                    .salaryRange("$50,000 - $65,000")
                    .type("Part-time")
                    .status("OPEN")
                    .department(engDept)
                    .createdBy(hr)
                    .build());

            // Job 9 - Data Science (Contract)
            jobRepository.save(Job.builder()
                    .title("Data Analyst - Contract")
                    .description("6-month contract role analyzing customer behavior data and building executive dashboards. Proficiency in SQL, Python, and Tableau required. Help us derive actionable insights from petabytes of user engagement data.")
                    .location("Boston, MA (On-site)")
                    .salaryRange("$75/hr - $95/hr")
                    .type("Contract")
                    .status("OPEN")
                    .department(dataDept)
                    .createdBy(hr)
                    .build());

            // Job 10 - Engineering (Internship)
            jobRepository.save(Job.builder()
                    .title("Software Engineering Intern - Summer 2027")
                    .description("12-week paid internship working on real production features alongside senior engineers. You'll gain hands-on experience with Java, React, AWS, and agile development. Open to current CS undergraduates and Master's students.")
                    .location("San Francisco, CA (On-site)")
                    .salaryRange("$45/hr")
                    .type("Internship")
                    .status("OPEN")
                    .department(engDept)
                    .createdBy(hr)
                    .build());

            // Job 11 - Product (Remote)
            jobRepository.save(Job.builder()
                    .title("Technical Writer")
                    .description("Create developer documentation, API guides, and knowledge base articles for our platform. Strong technical writing skills and ability to translate complex concepts into clear, concise docs. Experience with docs-as-code workflows preferred.")
                    .location("Remote (Worldwide)")
                    .salaryRange("$85,000 - $110,000")
                    .type("Full-time")
                    .status("OPEN")
                    .department(prodDept)
                    .createdBy(hr)
                    .build());

            // Job 12 - Design (Contract)
            jobRepository.save(Job.builder()
                    .title("Brand Identity Designer")
                    .description("3-month contract to redesign our brand identity including logo, color system, typography, and brand guidelines. Must have an outstanding portfolio showing brand work for tech companies. Deliverables include a comprehensive brand book.")
                    .location("Remote (US)")
                    .salaryRange("$80/hr - $110/hr")
                    .type("Contract")
                    .status("OPEN")
                    .department(designDept)
                    .createdBy(hr)
                    .build());

            log.info("All job listings seeded (12 jobs).");

            // 5. MCQ Assessment Seed
            Assessment assessment = Assessment.builder()
                    .job(devJob)
                    .title("Core Java & Spring Framework Assessment")
                    .durationMinutes(20)
                    .passingScore(60.0)
                    .negativeMarkingFactor(0.25)
                    .status("ACTIVE")
                    .build();
            assessment = assessmentRepository.save(assessment);
            log.info("Sample MCQ Assessment seeded.");

            // Question 1: Single Choice
            Question q1 = Question.builder()
                    .assessment(assessment)
                    .questionText("Which of the following classes implements a dynamic resizeable array in Java?")
                    .points(5)
                    .type("SINGLE_CHOICE")
                    .build();
            q1 = questionRepository.save(q1);

            optionRepository.save(Option.builder().question(q1).optionText("LinkedList").correct(false).build());
            optionRepository.save(Option.builder().question(q1).optionText("ArrayList").correct(true).build());
            optionRepository.save(Option.builder().question(q1).optionText("HashMap").correct(false).build());
            optionRepository.save(Option.builder().question(q1).optionText("Vector").correct(false).build());

            // Question 2: True/False
            Question q2 = Question.builder()
                    .assessment(assessment)
                    .questionText("Spring Bean Scope 'prototype' creates a single shared bean instance per application context.")
                    .points(3)
                    .type("TRUE_FALSE")
                    .build();
            q2 = questionRepository.save(q2);

            optionRepository.save(Option.builder().question(q2).optionText("True").correct(false).build());
            optionRepository.save(Option.builder().question(q2).optionText("False").correct(true).build());

            log.info("Sample MCQ Questions seeded.");

            // 6. Coding Assessment Seed
            CodingQuestion cq = CodingQuestion.builder()
                    .job(devJob)
                    .title("Reverse a Linked List")
                    .description("Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nInput format: A space-separated list of integers representing node values.\nOutput format: A space-separated list of integers representing node values in reverse order.")
                    .constraints("The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000")
                    .difficulty("MEDIUM")
                    .templateJava("public class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}")
                    .templatePython("def reverseList(head):\n    # Write your code here\n    pass")
                    .templateCpp("ListNode* reverseList(ListNode* head) {\n    // Write your code here\n    return nullptr;\n}")
                    .templateJs("function reverseList(head) {\n    // Write your code here\n    return null;\n}")
                    .build();
            cq = codingQuestionRepository.save(cq);
            log.info("Sample Coding Question seeded.");

            // Test cases
            testCaseRepository.save(TestCase.builder().codingQuestion(cq).inputData("1 2 3 4 5").expectedOutput("5 4 3 2 1").hidden(false).build());
            testCaseRepository.save(TestCase.builder().codingQuestion(cq).inputData("1 2").expectedOutput("2 1").hidden(false).build());
            testCaseRepository.save(TestCase.builder().codingQuestion(cq).inputData("9").expectedOutput("9").hidden(true).build());

            log.info("Sample Test Cases seeded.");
        }

        log.info("Seed Data Initialization Completed Successfully.");
    }
}
