#!/bin/bash

# KYC Testing Script
# Usage: ./test-kyc.sh <jwt_token> [base_url]
#
# Example:
#   ./test-kyc.sh "eyJhbGc..." http://localhost:3000
#
# This script tests the complete KYC flow with mock provider

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parameters
JWT_TOKEN="${1:-}"
BASE_URL="${2:-http://localhost:3000}"

# Validate JWT token
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ Error: JWT token required${NC}"
    echo "Usage: ./test-kyc.sh <jwt_token> [base_url]"
    echo ""
    echo "Example:"
    echo "  ./test-kyc.sh \"eyJhbGc...\" http://localhost:3000"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}KYC Module Testing Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "JWT Token: ${JWT_TOKEN:0:30}..."
echo ""

# TEST 1: Create Mock KYC Session
echo -e "${YELLOW}[TEST 1] Creating Mock KYC Session...${NC}"
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/kyc/sessions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider":"mock"}')

echo "$SESSION_RESPONSE" | jq '.' 2>/dev/null || echo "$SESSION_RESPONSE"

# Extract sessionId and externalRef
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.sessionId' 2>/dev/null)
REDIRECT_URL=$(echo "$SESSION_RESPONSE" | jq -r '.redirectUrl' 2>/dev/null)
EXTERNAL_REF=$(echo "$REDIRECT_URL" | grep -oE '[^/]+$' 2>/dev/null || echo "")

if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}❌ Failed to create session${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Session created: $SESSION_ID${NC}"
echo "External Ref: $EXTERNAL_REF"
echo ""

# TEST 2: Get Latest Status
echo -e "${YELLOW}[TEST 2] Getting Latest KYC Status...${NC}"
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/kyc/sessions/latest" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

# TEST 3: Send Mock Webhook - APPROVE
echo -e "${YELLOW}[TEST 3] Simulating KYC Approval via Webhook...${NC}"
WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/kyc/webhook/mock" \
  -H "Content-Type: application/json" \
  -d "{
    \"externalRef\": \"$EXTERNAL_REF\",
    \"decision\": \"APPROVED\",
    \"fullName\": \"John Doe\",
    \"dob\": \"1990-01-01\"
  }")

echo "$WEBHOOK_RESPONSE" | jq '.' 2>/dev/null || echo "$WEBHOOK_RESPONSE"
echo ""

# TEST 4: Verify Status Changed
echo -e "${YELLOW}[TEST 4] Verifying Status Updated to APPROVED...${NC}"
FINAL_STATUS=$(curl -s -X GET "$BASE_URL/kyc/sessions/latest" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "$FINAL_STATUS" | jq '.' 2>/dev/null || echo "$FINAL_STATUS"

# Check if status is APPROVED
STATUS=$(echo "$FINAL_STATUS" | jq -r '.status' 2>/dev/null)
if [ "$STATUS" = "APPROVED" ]; then
    echo -e "${GREEN}✅ Status successfully updated to APPROVED${NC}"
else
    echo -e "${RED}❌ Status did not update correctly. Got: $STATUS${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Testing complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
