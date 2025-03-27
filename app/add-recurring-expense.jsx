import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ToastAndroid, Switch } from 'react-native'; 
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import Colors from './../utils/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from './../utils/SupabaseConfig'; // Supabase setup file
import { client } from '../utils/KindeConfig'

export default function AddRecurringExpense() {
    const [expenseName, setExpenseName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly'); // Default frequency
    const [loading, setLoading] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState(0); // Fetched from Supabase
    const [updatedIncome, setUpdatedIncome] = useState(0);
    const [remainingIncome, setRemainingIncome] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0); // Total income after bonus adjustments

    const [deduction, setDeduction] = useState();
    const router = useRouter();
  
    // Fetch the monthly income from Supabase when the page loads
    useEffect(() => {
      const fetchIncome = async () => {
        try {
          const user = await client.getUserDetails();  // Get the user details (email)
          const year = new Date().getFullYear();
          const month = new Date().getMonth() + 1; // Current month (1-based index)
  
          // Fetch the user's monthly income from the 'monthly_finances' table
          const { data, error } = await supabase
            .from('monthly_finances')
            .select('total_income, monthly_expense, remaining_income')
            .eq('user_mail', user.email)
            .eq('month', month)
            .eq('year', year)
            .single(); // Fetch single row (one entry for the month)
  
          if (error) {
            console.error('Error fetching monthly income from Supabase:', error);
            setMonthlyIncome(0); // Set to 0 if an error occurs
            setUpdatedIncome(0);
            setRemainingIncome(0); // Set remaining income to 0 if error occurs
            setTotalIncome(0); // Set total income to 0 if error occurs
          } else {
            setMonthlyIncome(data ? data.total_income : 0); // If data exists, use total_income, otherwise 0
            setUpdatedIncome(data ? data.remaining_income : 0); // Set updated income as well
            setRemainingIncome(data? data.remaining_income : 0); // Set remaining income as fetched value
            setTotalIncome(data ? data.total_income : 0); // Set total income as fetched value
          }
        } catch (error) {
          console.error('Error fetching monthly income:', error);
        }
      };
  
      fetchIncome();
    }, []);
  
    // Calculate deduction based on the frequency
    useEffect(() => {
      let deduction = parseFloat(amount || 0);
      let monthsToDeduct = 1; // Default to monthly deduction
  
      if (frequency === 'quarterly') {
        monthsToDeduct = 3;
        deduction = deduction / monthsToDeduct;
      } else if (frequency === 'halfYearly') {
        monthsToDeduct = 6;
        deduction = deduction / monthsToDeduct;
      } else if (frequency === 'yearly') {
        monthsToDeduct = 12;
        deduction = deduction / monthsToDeduct;
      }
  
      setUpdatedIncome(remainingIncome - deduction);
      setDeduction(deduction); // Update the income after deduction based on total income
    }, [amount, frequency, remainingIncome]);
  
    const onSaveRecurringExpense = async () => {
        setLoading(true);
        try {
          const user = await client.getUserDetails();
          const year = new Date().getFullYear();
          const month = new Date().getMonth() + 1; // Current month (1-based index)
      
          console.log('Saving Recurring Expense:', {
            name: expenseName,
            amount: parseFloat(amount),
            frequency,
            user_mail: user.email, // Use email from KindeConfig
          });
      
          // Calculate deduction per month based on frequency
          let monthsToDeduct = 1; // Default to monthly deduction
          let deduction = parseFloat(amount || 0);
      
          if (frequency === 'quarterly') {
            monthsToDeduct = 3;
            deduction = deduction / 3;
          } else if (frequency === 'halfYearly') {
            monthsToDeduct = 6;
            deduction = deduction / 6;
          } else if (frequency === 'yearly') {
            monthsToDeduct = 12;
            deduction = deduction / 12;
          }
      
          // Save or update the recurring expense in the `recurring_expenses` table
          const { error: recurringError } = await supabase
            .from('recurring_expenses')
            .upsert([
              {
                expense_name: expenseName,
                amount: parseFloat(amount),
                frequency,
                start_date: new Date(), // Current date
                user_mail: user.email, // Reference user
              },
            ]);
      
          if (recurringError) throw recurringError;
      
          // Update affected months in `monthly_finances`
          for (let i = 0; i < monthsToDeduct; i++) {
            const currentMonth = (month + i - 1) % 12 + 1; // Calculate month (handle overflow to next year)
            const currentYear = month + i > 12 ? year + 1 : year;
      
            // Fetch the existing row for the current month
            const { data: existingRow, error: fetchError } = await supabase
              .from('monthly_finances')
              .select('total_income, monthly_expense, remaining_income')
              .eq('user_mail', user.email)
              .eq('month', currentMonth)
              .eq('year', currentYear)
              .single(); // Fetch single row
      
            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
            const totalIncome = existingRow ? existingRow.total_income : 0;
            const monthlyExpense = existingRow ? existingRow.monthly_expense : 0;
            const remainingIncome = existingRow ? existingRow.remaining_income : totalIncome;
      
            // Calculate new values
            const newMonthlyExpense = monthlyExpense + deduction;
            const newRemainingIncome = remainingIncome - deduction;
      
            // Update the row for the current month
            const { error: updateError } = await supabase
              .from('monthly_finances')
              .update([
                {
                  total_income: totalIncome, // Keep the original total income
                  remaining_income: newRemainingIncome, // Update remaining income
                  monthly_expense: newMonthlyExpense, // Update monthly expense
                  updated_at: new Date().toISOString(), // Update timestamp
                },
              ])
              .eq('user_mail', user.email)
              .eq('month', currentMonth)
              .eq('year', currentYear);
      
            if (updateError) throw updateError;
          }
      
          // Show success toast
          ToastAndroid.show('Recurring expense saved and monthly finances updated!', ToastAndroid.SHORT);
      
          // Navigate to the profile page
          router.push('/profile');
        } catch (error) {
          console.error('Error saving recurring expense:', error);
          ToastAndroid.show('Error saving expense.', ToastAndroid.SHORT);
        } finally {
          setLoading(false);
        }
      };
      
  
    return (
      <View style={{ margin: 20, padding: 20 }}>
  
        {/* Expense Name Input */}
        <View style={styles.inputView}>
          <MaterialIcons name="label" size={24} color={Colors.RED} />
          <TextInput
            placeholder="Expense Name"
            onChangeText={(value) => setExpenseName(value)}
            style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
          />
        </View>
  
        {/* Expense Amount Input */}
        <View style={styles.inputView}>
          <MaterialIcons name="currency-rupee" size={24} color={Colors.RED} />
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            onChangeText={(value) => setAmount(value)}
            style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
          />
        </View>
  
        {/* Frequency Selector */}
        <View style={styles.inputView}>
          <MaterialIcons name="schedule" size={24} color={Colors.RED} />
          <Picker
            selectedValue={frequency}
            style={{ width: '100%', fontSize: 17, fontFamily: 'delius', margin: -5 }}
            onValueChange={(value) => setFrequency(value)}
          >
            <Picker.Item label="Monthly" value="monthly" />
            <Picker.Item label="Quarterly" value="quarterly" />
            <Picker.Item label="Half-Yearly" value="halfYearly" />
            <Picker.Item label="Yearly" value="yearly" />
          </Picker>
        </View>
  
        {/* Preview Deduction */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            {frequency === 'monthly'
              ? `Monthly Deduction: ₹${(amount || 0)}`
              : frequency === 'quarterly'
              ? `Quarterly Deduction (Monthly Preview): ₹${(amount / 3).toFixed(2)}`
              : frequency === 'halfYearly'
              ? `Half-Yearly Deduction (Monthly Preview): ₹${(amount / 6).toFixed(2)}`
              : frequency === 'yearly'
              ? `Yearly Deduction (Monthly Preview): ₹${(amount / 12).toFixed(2)}`
              : ''}
          </Text>
        </View>
  
        {/* Updated Income Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Remaining Income After Deduction: ₹{updatedIncome && updatedIncome.toFixed(2)}
          </Text>
        </View>
  
        {/* Save Button */}
        <TouchableOpacity
          style={styles.button}
          disabled={!expenseName || !amount || loading}
          onPress={onSaveRecurringExpense}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Save Expense</Text>
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
});
