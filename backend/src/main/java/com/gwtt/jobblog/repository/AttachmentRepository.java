package com.gwtt.jobblog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import com.gwtt.jobblog.domain.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findAllByJobPost_Id(@Param("jobPostId") Long jobPostId);
}
