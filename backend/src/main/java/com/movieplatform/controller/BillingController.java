package com.movieplatform.controller;

import com.movieplatform.dto.billing.CreateOrderRequest;
import com.movieplatform.dto.billing.OrderDTO;
import com.movieplatform.dto.billing.PlanDTO;
import com.movieplatform.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
public class BillingController {

    @Autowired
    private BillingService billingService;

    /**
     * GET /billing/plans - Get all subscription plans (public within auth)
     */
    @GetMapping("/plans")
    public ResponseEntity<List<PlanDTO>> getPlans() {
        return ResponseEntity.ok(billingService.getPlans());
    }

    /**
     * POST /billing/orders - Create a payment order after QR confirmation
     */
    @PostMapping("/orders")
    public ResponseEntity<OrderDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        String account = authentication.getName();
        OrderDTO order = billingService.createOrder(account, request);
        return ResponseEntity.ok(order);
    }

    /**
     * GET /billing/orders - Get payment history for current user
     */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getOrderHistory(Authentication authentication) {
        String account = authentication.getName();
        return ResponseEntity.ok(billingService.getOrderHistory(account));
    }
}
