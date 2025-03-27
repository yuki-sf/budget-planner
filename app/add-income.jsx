import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ToastAndroid, Switch } from 'react-native'; 
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import Colors from './../utils/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './../utils/SupabaseConfig'; // Supabase setup file
import { client } from '../utils/KindeConfig'

export default function AddIncome() {
    const [selectedColor, setSelectedColor] = useState(Colors.RED);
    const [loading, setLoading] = useState(false);
    const [income, setIncome] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [bonusEnabled, setBonusEnabled] = useState(false);
    const [bonusType, setBonusType] = useState('amount'); // 'amount' or 'percentage'
    const [bonusValue, setBonusValue] = useState('');
    const [totalIncome, setTotalIncome] = useState(0); // For previewing total income
    const [userEmail, setUserEmail] = useState(''); // User email
    
    const router = useRouter();
  
    // Update the total income dynamically
    useEffect(() => {
      let finalIncome = parseFloat(income || 0);
  
      if (bonusEnabled) {
        if (bonusType === 'amount') {
          finalIncome += parseFloat(bonusValue || 0);
        } else if (bonusType === 'percentage') {
          finalIncome += (parseFloat(income || 0) * parseFloat(bonusValue || 0)) / 100;
        }
      }
  
      setTotalIncome(finalIncome || 0); // Ensure total income doesn't show NaN
    }, [income, bonusValue, bonusEnabled, bonusType]);
  
    // Fetch user email from AsyncStorage
    useEffect(() => {
      const fetchUserEmail = async () => {
        const email = await AsyncStorage.getItem('userEmail'); // Assuming user email is stored in AsyncStorage after login
        setUserEmail(email);
      };
  
      fetchUserEmail();
    }, []);
  
    const saveIncomeToStorage = async () => {
      try {
        // Save total income to AsyncStorage
        await AsyncStorage.setItem('monthlyIncome', totalIncome.toString());
      } catch (error) {
        console.error('Error saving income:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const onCreateIncome = async () => {
      setLoading(true);
      try {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1; // Months are zero-indexed
  
        console.log(`Saving income data:`, {
          income: totalIncome,
          month: bonusEnabled ? month : 'All Months',
          year,
        });
  
        // Save to Supabase
        const user = await client.getUserDetails();
  
        // First, check if data for the given month and year exists
        const { data: existingData, error: existingError } = await supabase
          .from('monthly_finances')
          .select('*')
          .eq('user_mail', user.email)
          .eq('month', month)
          .eq('year', year)
          .single();
  
        if (existingError) {
          throw existingError;
        }
  
        // Determine the correct data to insert based on whether bonus is enabled
        const dataToInsert = {
          user_mail: user.email,
          month: month,
          year: year,
          income: income,
          total_income: totalIncome,
          remaining_income: totalIncome,
          monthly_expense: 0, // First row: include bonus in total_income
          bonus_enabled: bonusEnabled,
          bonus_type: bonusType,
          bonus_value: parseFloat(bonusValue || 0),
          updated_at: new Date().toISOString(), // Update the timestamp for the record
        };
  
        // If data exists, update it; otherwise, insert a new row
        if (existingData) {
          // Update existing record with correct income and bonus data
          const { data, error } = await supabase
            .from('monthly_finances')
            .update(dataToInsert) // Update with the current income and bonus data
            .eq('id', existingData.id);  // Update the existing row based on id
  
          if (error) {
            throw error;
          }
  
          console.log('Data updated successfully.');
        } else {
          // Insert new record with the correct data
          const { data, error } = await supabase
            .from('monthly_finances')
            .insert([dataToInsert]);
  
          if (error) {
            throw error;
          }
  
          console.log('New data inserted successfully.');
        }
  
        // Now update the remaining months (from selected month to March 31st)
        let updatedMonth = month;
        let updatedYear = year;
  
        // Loop through all months from the selected month to March 31st
        let endMonth = 3;  // March (3rd month of the year)
  
        // Loop from selected month to March
        let firstMonthUpdated = false;
  
        while (updatedMonth <= endMonth) {
          const { data: existingDataForMonth, error: existingErrorForMonth } = await supabase
            .from('monthly_finances')
            .select('id')
            .eq('user_mail', user.email)
            .eq('month', updatedMonth)
            .eq('year', updatedYear)
            .single();
  
          if (existingErrorForMonth || existingDataForMonth === null) {
            // No existing data, create a new row
            await supabase
              .from('monthly_finances')
              .upsert([
                {
                  user_mail: user.email,
                  month: updatedMonth,
                  year: updatedYear,
                  income: income, // Set income without bonus
                  total_income: income,
                  monthly_expense: 0,
                  remaining_income: income, // No bonus applied here
                  bonus_enabled: false, // No bonus from now on
                  bonus_value: 0, // No bonus applied
                  updated_at: new Date().toISOString(), // Update the timestamp
                },
              ])
              .eq('user_mail', user.email)
              .eq('month', updatedMonth)
              .eq('year', updatedYear);
          } else {
            // If it's the first month, keep the bonus data
            const bonusData = firstMonthUpdated ? {
              bonus_enabled: false,
              bonus_value: 0,
              total_income: income,
              monthly_expense:0,
              remaining_income: income // No bonus applied here
            } : {
              bonus_enabled: bonusEnabled,
              bonus_value: parseFloat(bonusValue || 0),
              total_income: totalIncome,
              monthly_expense:0,
              remaining_income: totalIncome // Include bonus here
            };
  
            await supabase
              .from('monthly_finances')
              .update({
                income: income, // Update income
                total_income: bonusData.total_income,
                remaining_income: bonusData.remaining_income,
                monthly_expense: bonusData.monthly_expense, // Update total income correctly
                bonus_enabled: bonusData.bonus_enabled, // Correct bonus data
                bonus_value: bonusData.bonus_value, // Correct bonus value
                updated_at: new Date().toISOString(), // Update the timestamp
              })
              .eq('user_mail', user.email)
              .eq('month', updatedMonth)
              .eq('year', updatedYear);
  
            // After the first month, we no longer need to update with bonus data
            firstMonthUpdated = true;
          }
  
          const nextMonth = updatedMonth + 1;
          // If the month is beyond December, roll over to the next year
          if (nextMonth > 12) {
            updatedMonth = 1;
            updatedYear++;
          } else {
            updatedMonth = nextMonth;
          }
        }
  
        // Show success toast
        ToastAndroid.show('Income updated successfully for all affected months!', ToastAndroid.SHORT);
  
        // Navigate to the profile page
        router.push('/profile');
      } catch (error) {
        console.error('Error saving income:', error);
        ToastAndroid.show('Error updating income.', ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    };
  
    const onDateChange = (event, selected) => {
      setShowDatePicker(false);
      if (selected) {
        setSelectedDate(selected);
      }
    };
  
    return (
      <View style={{ margin: 20, padding: 20 }}>
  
        {/* Income Input */}
        <View style={styles.inputView}>
          <MaterialIcons name="currency-rupee" size={24} color={selectedColor} />
          <TextInput
            placeholder="Monthly Income"
            keyboardType="numeric"
            onChangeText={(value) => setIncome(value)}
            style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
          />
        </View>
  
        {/* Bonus Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Did you receive a bonus?</Text>
          <Switch
            value={bonusEnabled}
            onValueChange={setBonusEnabled}
            trackColor={{ false: Colors.GRAY, true: Colors.PRIMARY }}
            thumbColor={bonusEnabled ? Colors.WHITE : Colors.GRAY}
          />
        </View>
  
        {bonusEnabled && (
          <>
            {/* Bonus Input */}
            <View style={styles.inputView}>
              <MaterialIcons name="monetization-on" size={24} color={selectedColor} />
              <TextInput
                placeholder={`Enter Bonus (${bonusType === 'amount' ? 'Amount' : 'Percentage'})`}
                keyboardType="numeric"
                onChangeText={(value) => setBonusValue(value)}
                style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
              />
            </View>
  
            {/* Bonus Type Toggle */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Bonus Type:</Text>
              <TouchableOpacity
                style={[
                  styles.bonusTypeButton,
                  bonusType === 'amount' && styles.activeBonusType,
                ]}
                onPress={() => setBonusType('amount')}
              >
                <Text style={styles.bonusTypeText}>Amount</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.bonusTypeButton,
                  bonusType === 'percentage' && styles.activeBonusType,
                ]}
                onPress={() => setBonusType('percentage')}
              >
                <Text style={styles.bonusTypeText}>Percentage</Text>
              </TouchableOpacity>
            </View>
  
            {/* Month and Year Picker */}
            <TouchableOpacity
              style={[styles.inputView, { marginTop: 20 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={24} color={selectedColor} />
              <Text style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}>
                {`Selected Month: ${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getFullYear()}`}
              </Text>
            </TouchableOpacity>
  
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
              />
            )}
          </>
        )}
  
        {/* Total Income Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Total Income: ₹{totalIncome.toFixed(2)}
          </Text>
        </View>
  
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          disabled={!income || loading}
          onPress={() => onCreateIncome()}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

const styles = StyleSheet.create({
    inputView: {
      borderWidth: 1,
      flexDirection: 'row',
      gap: 5,
      padding: 10,
      borderRadius: 10,
      borderColor: Colors.GRAY,
      backgroundColor: Colors.WHITE,
      alignItems: 'center',
      marginTop: 20,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: 'delius',
    },
    previewContainer: {
      marginTop: 20,
      padding: 10,
      backgroundColor: Colors.LIGHT_GRAY,
      borderRadius: 10,
    },
    previewText: {
      fontSize: 18,
      fontFamily: 'delius-bold',
      color: Colors.BLACK,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 15,
      borderRadius: 10,
      marginTop: 30,
      width: '100%',
    },
    buttonText: {
      textAlign: 'center',
      fontSize: 16,
      color: Colors.WHITE,
      fontFamily: 'delius',
    },
    bonusTypeButton: {
      borderWidth: 1,
      borderColor: Colors.GRAY,
      borderRadius: 10,
      padding: 10,
      marginHorizontal: 5,
    },
    activeBonusType: {
      borderColor: Colors.PRIMARY,
      backgroundColor: Colors.PRIMARY,
    },
    bonusTypeText: {
      fontSize: 14,
      fontFamily: 'delius',
      color: Colors.WHITE,
    },
  });
