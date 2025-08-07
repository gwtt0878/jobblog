package com.gwtt.jobblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gwtt.jobblog.domain.JobPost;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {
    @Query("SELECT jp FROM JobPost jp JOIN FETCH jp.user WHERE jp.id = :id")
    Optional<JobPost> findWithUserById(@Param("id") Long id);

    List<JobPost> findAllByUser_Id(@Param("userId") Long userId);
}
