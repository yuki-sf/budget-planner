import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, ActivityIndicator } from 'react-native';
import RNOtpVerify from 'react-native-otp-verify';

export default function AutomaticPayment() {
  const [smsDetails, setSmsDetails] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [extractedAmount, setExtractedAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize OTP listener
    RNOtpVerify.getOtp()
      .then((p) => RNOtpVerify.addListener(onSmsReceived))
      .catch((error) => {
        console.error('Error starting OTP listener:', error);
        ToastAndroid.show('Failed to start SMS listener', ToastAndroid.SHORT);
      });

    // Cleanup OTP listener on unmount
    return () => {
      RNOtpVerify.removeListener();
    };
  }, []);

  const onSmsReceived = (message) => {
    // Example SMS message: "Your account has been debited with ₹1500 by Paytm"
    console.log('SMS Received:', message);

    // Extract sender name and amount using regex
    const senderMatch = message.match(/from\s+([a-zA-Z]+)/i); // Matches "from [SenderName]"
    const amountMatch = message.match(/₹(\d+(\.\d+)?)/); // Matches amounts like ₹1500 or ₹1500.00

    const sender = senderMatch ? senderMatch[1] : 'Unknown Sender';
    const amount = amountMatch ? amountMatch[1] : '0';

    setSenderName(sender);
    setExtractedAmount(amount);
    setSmsDetails(message);

    ToastAndroid.show('SMS details extracted!', ToastAndroid.SHORT);
  };

  const saveAutomaticPayment = async () => {
    setLoading(true);
    try {
      // Save senderName and extractedAmount to your database here

      // Simulate saving
      setTimeout(() => {
        setLoading(false);
        ToastAndroid.show('Payment Saved!', ToastAndroid.SHORT);
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error('Error saving payment:', error);
      ToastAndroid.show('Error saving payment!', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automatic Payment</Text>
      {smsDetails ? (
        <View>
          <Text>Sender: {senderName}</Text>
          <Text>Amount: ₹{extractedAmount}</Text>
          <Text>Message: {smsDetails}</Text>
        </View>
      ) : (
        <Text>Waiting for SMS...</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={saveAutomaticPayment}
        disabled={loading || !extractedAmount}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
