package com.movieplatform.service;

import com.movieplatform.dto.billing.CreateOrderRequest;
import com.movieplatform.dto.billing.OrderDTO;
import com.movieplatform.dto.billing.PlanDTO;
import com.movieplatform.entity.PaymentOrder;
import com.movieplatform.entity.SubscriptionPlan;
import com.movieplatform.entity.User;
import com.movieplatform.exception.ResourceNotFoundException;
import com.movieplatform.repository.PaymentOrderRepository;
import com.movieplatform.repository.SubscriptionPlanRepository;
import com.movieplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private PaymentOrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all active subscription plans
     */
    public List<PlanDTO> getPlans() {
        return planRepository.findByIsActiveTrueOrderByPriceAsc().stream()
                .map(this::toPlanDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a payment order and upgrade user's membership rank
     */
    @Transactional
    public OrderDTO createOrder(String account, CreateOrderRequest request) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        // Calculate expiration date
        LocalDateTime expiresAt = plan.getDurationDays() > 0
                ? LocalDateTime.now().plusDays(plan.getDurationDays())
                : null;

        // Create the payment order
        PaymentOrder order = new PaymentOrder();
        order.setUserId(user.getId());
        order.setPlanId(plan.getId());
        order.setAmount(plan.getPrice());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "QR_BANK_TRANSFER");
        order.setStatus(PaymentOrder.OrderStatus.COMPLETED);
        order.setPlanName(plan.getName());
        order.setExpiresAt(expiresAt);

        orderRepository.save(order);

        // Upgrade user's membership rank
        user.setMembershipRank(plan.getRankLevel());
        userRepository.save(user);

        return toOrderDTO(order, plan.getRankLevel().name());
    }

    /**
     * Get payment order history for a user
     */
    public List<OrderDTO> getOrderHistory(String account) {
        User user = userRepository.findByEmailOrPhoneNumber(account, account)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(order -> {
                    // Look up plan rank level
                    String rankLevel = planRepository.findById(order.getPlanId())
                            .map(p -> p.getRankLevel().name())
                            .orElse("MEMBER");
                    return toOrderDTO(order, rankLevel);
                })
                .collect(Collectors.toList());
    }

    private PlanDTO toPlanDTO(SubscriptionPlan plan) {
        List<String> featureList = plan.getFeatures() != null
                ? Arrays.asList(plan.getFeatures().split(";"))
                : List.of();

        return new PlanDTO(
                plan.getId(),
                plan.getName(),
                plan.getRankLevel().name(),
                plan.getPrice(),
                plan.getDurationDays(),
                featureList
        );
    }

    private OrderDTO toOrderDTO(PaymentOrder order, String rankLevel) {
        return new OrderDTO(
                order.getId(),
                order.getPlanName(),
                rankLevel,
                order.getAmount(),
                order.getPaymentMethod(),
                order.getStatus().name(),
                order.getExpiresAt(),
                order.getCreatedAt()
        );
    }
}
