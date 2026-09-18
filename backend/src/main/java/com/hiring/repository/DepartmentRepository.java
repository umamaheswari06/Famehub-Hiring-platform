// We'll write JobRepository, DepartmentRepository, ResumeRepository, and ApplicationRepository in separate files to keep package imports correct.
package com.hiring.repository;

import com.hiring.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByName(String name);
    java.util.Optional<Department> findByName(String name);
}
