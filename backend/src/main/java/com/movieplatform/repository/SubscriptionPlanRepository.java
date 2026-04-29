package com.movieplatform.repository;

import com.movieplatform.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Integer> {
    List<SubscriptionPlan> findByIsActiveTrueOrderByPriceAsc();
}
