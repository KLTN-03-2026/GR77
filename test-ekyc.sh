#!/bin/bash
# eKYC Verification Feature - Integration Test Script
# Usage: Run in terminal to validate all endpoints

API_URL="http://localhost:3001"
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="TestPassword123!"

echo "🧪 eKYC Verification Feature - Integration Tests"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a test user
echo -e "${YELLOW}Test 1: Register Test User${NC}"
echo "POST $API_URL/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_USER_EMAIL\", \"password\": \"$TEST_USER_PASSWORD\"}")

echo "$REGISTER_RESPONSE"
echo ""

# Test 2: Login to get token
echo -e "${YELLOW}Test 2: Login to Get JWT Token${NC}"
echo "POST $API_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_USER_EMAIL\", \"password\": \"$TEST_USER_PASSWORD\"}")

echo "$LOGIN_RESPONSE"
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
echo "Access Token: $ACCESS_TOKEN"
echo ""

# Test 3: Get user info (check eKYC status)
echo -e "${YELLOW}Test 3: Get User Info - Check eKYC Status${NC}"
echo "GET $API_URL/auth/me"
USER_INFO=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$USER_INFO"
IS_KYC_VERIFIED=$(echo "$USER_INFO" | jq -r '.isKycVerified // false')
echo "isKycVerified: $IS_KYC_VERIFIED"
echo ""

# Test 4: Try to create campaign WITHOUT eKYC verification
echo -e "${YELLOW}Test 4: Create Campaign WITHOUT eKYC - Should FAIL (403)${NC}"
echo "POST $API_URL/campaigns"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/campaigns" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Campaign\",
    \"description\": \"This should fail\",
    \"category\": \"Healthcare\",
    \"locationText\": \"Hanoi\",
    \"fundingGoalAmount\": 1000000,
    \"minimumDonationAmount\": 10000,
    \"startAt\": \"2026-04-15T00:00:00Z\",
    \"endAt\": \"2026-05-15T00:00:00Z\"
  }")

echo "$CREATE_RESPONSE"
STATUS_CODE=$(echo "$CREATE_RESPONSE" | jq -r '.statusCode // 201')
MESSAGE=$(echo "$CREATE_RESPONSE" | jq -r '.message // ""')

if [[ "$STATUS_CODE" == "403" ]] && [[ "$MESSAGE" == *"eKYC"* ]]; then
  echo -e "${GREEN}✅ PASS: Got expected 403 Forbidden error with eKYC message${NC}"
else
  echo -e "${RED}❌ FAIL: Expected 403 with eKYC message, got: $STATUS_CODE - $MESSAGE${NC}"
fi
echo ""

# Test 5: Simulate eKYC verification (for testing)
echo -e "${YELLOW}Test 5: Update User - Simulate eKYC Verification${NC}"
echo "NOTE: This would normally be done through a separate eKYC API"
echo "For testing, you can manually update database:"
echo "UPDATE users SET is_kyc_verified = true WHERE email = '$TEST_USER_EMAIL';"
echo ""

# Test 6: Try to create campaign WITH eKYC verification (mock)
echo -e "${YELLOW}Test 6: Create Campaign WITH eKYC - Should SUCCEED${NC}"
echo "POST $API_URL/campaigns"
echo "(After updating is_kyc_verified to true in database)"
CREATE_SUCCESS=$(curl -s -X POST "$API_URL/campaigns" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Test Campaign Success\",
    \"description\": \"This should succeed after eKYC\",
    \"category\": \"Healthcare\",
    \"locationText\": \"Hanoi\",
    \"fundingGoalAmount\": 1000000,
    \"minimumDonationAmount\": 10000,
    \"startAt\": \"2026-04-15T00:00:00Z\",
    \"endAt\": \"2026-05-15T00:00:00Z\"
  }")

echo "$CREATE_SUCCESS"
CAMPAIGN_ID=$(echo "$CREATE_SUCCESS" | jq -r '.id // empty')
if [[ -n "$CAMPAIGN_ID" ]]; then
  echo -e "${GREEN}✅ PASS: Campaign created successfully with ID: $CAMPAIGN_ID${NC}"
else
  echo -e "${RED}❌ FAIL: Campaign creation failed${NC}"
fi
echo ""

echo "🏁 Integration Tests Complete"
echo "=================================================="
