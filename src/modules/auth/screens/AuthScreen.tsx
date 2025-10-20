import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { PhoneLoginForm } from '../components/PhoneLoginForm';
import { OTPVerificationForm } from '../components/OTPVerificationForm';

type AuthStep = 'phone' | 'otp';

export const AuthScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleOTPSent = (phone: string, session: string) => {
    setPhoneNumber(phone);
    setSessionId(session);
    setCurrentStep('otp');
  };

  const handleVerificationSuccess = () => {
    // Navigation will be handled by the auth state change
    console.log('Authentication successful');
  };

  const handleBackToPhone = () => {
    setCurrentStep('phone');
  };

  return (
    <View style={styles.container}>
      {currentStep === 'phone' ? (
        <PhoneLoginForm onOTPSent={handleOTPSent} />
      ) : (
        <OTPVerificationForm
          phoneNumber={phoneNumber}
          sessionId={sessionId}
          onVerificationSuccess={handleVerificationSuccess}
          onBack={handleBackToPhone}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
