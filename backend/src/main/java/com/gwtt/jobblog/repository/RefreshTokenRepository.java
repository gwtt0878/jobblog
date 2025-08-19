package com.gwtt.jobblog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import com.gwtt.jobblog.domain.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByJti(String jti);

    List<RefreshToken> findAllByUserId(Long userId);

      // 전역 무효화: 벌크 업데이트
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update RefreshToken rt
        set rt.revoked = true
        where rt.userId = :userId
        and rt.revoked = false
    """)
    int bulkRevokeByUserId(@Param("userId") Long userId);
}