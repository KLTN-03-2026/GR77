/**
 * KYC Module - Environment Variables Configuration
 * 
 * 📋 Required Environment Variables for Sumsub Integration
 * 
 * Add these to your .env.local or .env file:
 * 
 * ```
 * # Sumsub KYC Configuration
 * SUMSUB_API_KEY=your_api_key_from_sumsub
 * SUMSUB_SECRET_KEY=your_secret_key_from_sumsub
 * SUMSUB_API_URL=https://api.sumsub.com  # or https://api.sandbox.sumsub.com for testing
 * ```
 * 
 * 🔑 How to Get Sumsub Credentials:
 * 
 * 1. Sign up at: https://sumsub.com/
 * 2. Go to Dashboard → API Settings
 * 3. Create API token (API Key)
 * 4. Create Secret Key for webhooks
 * 5. Copy both to .env
 * 
 * 🧪 Testing with Sandbox:
 * - Use: SUMSUB_API_URL=https://api.sandbox.sumsub.com
 * - Get sandbox credentials from Sumsub dashboard
 * 
 * 🔒 Security Notes:
 * - NEVER commit .env with real credentials to git
 * - Use .env.local for local development
 * - Use secure secret management (e.g., AWS Secrets Manager) for production
 * - Webhook signature verification REQUIRES correct SUMSUB_SECRET_KEY
 * 
 * 📡 Webhook Configuration in Sumsub Dashboard:
 * 
 * 1. Go to Dashboard → Webhooks
 * 2. Add webhook URL: https://your-domain.com/kyc/webhook/sumsub
 * 3. Secret Key: Must match SUMSUB_SECRET_KEY in .env
 * 4. Event type: Select "Applicant Review Completed"
 * 5. Test: Use "Test webhook" button to verify setup
 * 
 * ✅ Webhook Events:
 * - applicant.review.completed
 * - applicant.review.revised
 * - applicant.review.rejected
 * 
 * 💡 API Endpoints:
 * 
 * - POST /kyc/sessions?provider=sumsub
 *   Creates new KYC session, returns redirect URL
 *   
 * - GET /kyc/sessions/latest
 *   Get user's latest KYC session status
 *   
 * - POST /kyc/webhook/sumsub
 *   Sumsub callback endpoint (public, no auth)
 *   Header: X-Signature (automatic verification)
 * 
 * 🎯 Flow:
 * 
 * 1. User: POST /kyc/sessions?provider=sumsub
 * 2. API: Creates applicant on Sumsub, returns redirectUrl
 * 3. User: Redirected to Sumsub verification page
 * 4. User: Completes verification (selfie + documents)
 * 5. Sumsub: Makes decision (APPROVED/REJECTED)
 * 6. Sumsub: Sends webhook to POST /kyc/webhook/sumsub
 * 7. API: Verifies signature, updates KYC status in DB
 * 8. User: Can check status with GET /kyc/sessions/latest
 * 
 * ⚠️ Common Issues:
 * 
 * 1. "Invalid webhook signature"
 *    → Check SUMSUB_SECRET_KEY matches webhook secret in Sumsub dashboard
 *    
 * 2. "Missing X-Signature header"
 *    → Verify webhook is configured in Sumsub dashboard
 *    
 * 3. "Unknown provider"
 *    → Use provider='sumsub' (lowercase) in requests
 *    
 * 4. "Failed to create applicant"
 *    → Check API credentials are correct
 *    → Check SUMSUB_API_URL is correct (sandbox vs production)
 */

export const KYC_ENV_CONFIG = {
  sumsub: {
    apiKey: process.env.SUMSUB_API_KEY,
    secretKey: process.env.SUMSUB_SECRET_KEY,
    apiUrl: process.env.SUMSUB_API_URL || 'https://api.sumsub.com',
  },
};
