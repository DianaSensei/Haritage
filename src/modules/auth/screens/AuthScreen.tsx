import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/shared/hooks";
import { OTPVerificationForm } from "../components/OTPVerificationForm";
import { PhoneLoginForm } from "../components/PhoneLoginForm";

type AuthStep = "phone" | "otp";

export const AuthScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sessionId, setSessionId] = useState("");
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleOTPSent = (phone: string, sessionId: string) => {
    setPhoneNumber(phone);
    setSessionId(sessionId);
    setCurrentStep("otp");
  };

  const handleVerificationSuccess = () => {
    // Navigation will be handled by the auth state change
    console.log("Authentication successful");
  };

  const handleBackToPhone = () => {
    setCurrentStep("phone");
  };

  // console.log("AuthScreen render, currentStep:", currentStep);
  return (
    <View style={styles.container}>
      {currentStep === "phone" ? (
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

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    }
  });
