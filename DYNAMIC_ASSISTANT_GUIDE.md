# Dynamic Assistant Setup Guide

## Overview
The Dynamic Assistant feature automatically creates personalized AI interviewers for each candidate based on their CV and the job description. This provides a much more relevant and targeted interview experience.

## How It Works

### 1. **Automatic Process Flow:**
```
Upload CV + JD → Extract CV Summary → Generate Custom Prompt → Create Assistant → Start Interview
```

### 2. **Personalization Elements:**
- **Custom Greeting**: Uses candidate's name
- **Tailored Questions**: Based on provided interview questions
- **CV-Aware**: References candidate's background and experience
- **Job-Specific**: Focuses on skills relevant to the job description
- **Adaptive Flow**: Adjusts based on candidate's experience level

### 3. **Assistant Configuration:**
- **Model**: GPT-4 for intelligent conversations
- **Voice**: Jennifer (PlayHT) for professional, clear speech
- **Language**: English optimized for technical interviews
- **Temperature**: 0.7 for natural but focused responses

## Setup Requirements

### 1. **Vapi Account Setup:**
```bash
# Visit https://dashboard.vapi.ai
# Create account and verify email
# Navigate to API Keys section
```

### 2. **Get Required Keys:**
```bash
# You need 3 keys:
VAPI_PRIVATE_KEY=vapi_sk_abc123...    # For creating assistants (backend)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=vapi_pk_xyz789...  # For starting calls (frontend)  
NEXT_PUBLIC_VAPI_ASSISTANT_ID=assistant_id     # Fallback assistant (optional)
```

### 3. **Environment Configuration:**
```bash
# Update .env.local with your actual keys:
VAPI_PRIVATE_KEY=vapi_sk_your_actual_private_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=vapi_pk_your_actual_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_fallback_assistant_id  # Optional
```

### 4. **Restart Development Server:**
```bash
npm run dev
```

## Features & Benefits

### ✅ **Dynamic Features:**
- **Personalized Greeting**: "Hello [Name]! Welcome to your interview for [Position]"
- **CV References**: "I see from your CV that you have experience with..."
- **Relevant Questions**: Only asks questions appropriate to the role
- **Smart Follow-ups**: Asks deeper questions based on their background
- **Professional Tone**: Adapts communication style to company culture

### ✅ **Fallback System:**
- If dynamic creation fails, uses default assistant
- Graceful error handling with user feedback
- No interview disruption

### ✅ **User Experience:**
- Progress indicator during assistant creation
- Clear status messages
- Visual confirmation when assistant is ready
- Seamless transition to interview

## Usage Flow

### 1. **For Users:**
```
1. Upload CV and paste Job Description
2. Select "Vapi AI Video Call" mode
3. Click "Start AI Video Interview" 
4. See "Creating AI Interviewer..." progress
5. Wait for "✓ Custom AI interviewer ready"
6. Begin personalized interview
```

### 2. **Behind the Scenes:**
```
1. Extract key info from CV
2. Analyze job requirements  
3. Generate custom system prompt
4. Create assistant via Vapi API
5. Configure voice and model settings
6. Return assistant ID for interview
```

## Troubleshooting

### ❌ **Common Issues:**

**"VAPI_PRIVATE_KEY not configured"**
- Solution: Add valid private key to .env.local
- Format: Must start with `vapi_sk_`

**"Failed to create assistant"**  
- Solution: Check API key permissions
- Fallback: Uses default assistant automatically

**"Assistant creation takes too long"**
- Expected: 5-15 seconds for creation
- Timeout: 30 seconds before fallback

### ✅ **Verification Steps:**
1. Check `.env.local` has correct key formats
2. Verify Vapi dashboard shows API usage
3. Test with simple CV and JD first
4. Check browser console for detailed errors

## Cost Considerations

### **Vapi Pricing Impact:**
- Each dynamic assistant creation costs ~$0.01-0.05
- Assistant can be reused for similar roles
- Consider assistant cleanup for production
- Monitor usage in Vapi dashboard

### **Optimization Tips:**
- Cache assistants for similar job roles
- Implement assistant cleanup after interviews
- Use fallback for development/testing
- Monitor API usage and costs

## Advanced Configuration

### **Custom Voice Options:**
```typescript
voice: {
  provider: "playht",
  voiceId: "jennifer"  // or "michael", "sara", etc.
}
```

### **Model Tuning:**
```typescript
model: {
  provider: "openai",
  model: "gpt-4",
  temperature: 0.7,    // Creativity level
  maxTokens: 500       // Response length
}
```

### **Language Support:**
```typescript
transcriber: {
  provider: "deepgram",
  model: "nova-2",
  language: "en"       // or "es", "fr", etc.
}
```

This dynamic assistant system transforms each interview into a personalized, relevant experience that adapts to both the candidate's background and the specific job requirements.
