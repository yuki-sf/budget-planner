import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { client } from './../../utils/KindeConfig';
import { supabase } from './../../utils/SupabaseConfig';
import Header from '../../components/Header';
import Colors from './../../utils/Colors';
import { BarChart } from 'react-native-chart-kit';
import Svg, { Rect } from 'react-native-svg';

export default function Profile() {
  const router = useRouter();
  const profileView = true;
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null); // Bar chart data
  const [showIncome, setShowIncome] = useState(true); // Toggle for income/expense
  const screenWidth = Dimensions.get('window').width; // Device width
  const barWidth = 40; // Width of each bar
  const spacing = 20; // Spacing between bars

  // Logout function
  const handleLogout = async () => {
    const loggedOut = await client.logout();
    if (loggedOut) {
      await services.storeData('login', 'false');
      router.replace('/login');
    }
  };

  // Navigation to add income/expenses
  const onIncomeClick = () => {
    router.push({ pathname: '/add-income' });
  };

  const onExpenseClick = () => {
    router.push({ pathname: '/add-recurring-expense' });
  };

  const onAutomaticPaymentClick = () => {
    router.push({ pathname: '/sms-reader' }); // Navigate to automatic payment page
  };

  // Fetch monthly income and expenses for the financial year
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const user = await client.getUserDetails(); // Fetch user details
        const { data, error } = await supabase
          .from('monthly_finances')
          .select('month, total_income, monthly_expense')
          .eq('user_mail', user.email)
          .order('month', { ascending: true }); // Fetch all financial data sorted by month

        if (error) throw error;

        // Process chart data
        const labels = Array.from({ length: 12 }, (_, i) =>
          new Date(2000, i).toLocaleString('default', { month: 'short' })
        ); // Short month names
        const incomeData = Array(12).fill(0); // Initialize empty income array
        const expenseData = Array(12).fill(0); // Initialize empty expense array

        data.forEach(({ month, total_income, monthly_expense }) => {
          const index = month - 1; // Correct 1-based index to 0-based
          incomeData[index] = total_income || 0; // Update income for respective month
          expenseData[index] = monthly_expense || 0; // Update expenses for respective month
        });

        setChartData({ labels, incomeData, expenseData }); // Set chart data
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const chartWidth = chartData ? chartData.labels.length * (barWidth + spacing) : screenWidth; // Dynamic width for horizontal scrolling

  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Header handleLogout={handleLogout} profileView={profileView} />
      </View>

      {/* Welcome Section */}
      <View style={styles.profileContainer}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Welcome to your profile</Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onIncomeClick} style={styles.button}>
            <Text style={styles.buttonText}>Edit Monthly Income</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onExpenseClick} style={styles.button}>
            <Text style={styles.buttonText}>Edit Recurring Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAutomaticPaymentClick} style={styles.button}>
            <Text style={styles.buttonText}>Edit Automatic Payments</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View  style={[styles.profileContainer,{marginTop:-5}]}>  
      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setShowIncome(true)}
          style={[styles.toggleButton, showIncome && styles.activeToggle]}
        >
          <Text style={[styles.toggleText, showIncome && styles.activeToggleText]}>
            Income Chart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowIncome(false)}
          style={[styles.toggleButton, !showIncome && styles.activeToggle]}
        >
          <Text style={[styles.toggleText, !showIncome && styles.activeToggleText]}>
            Expense Chart
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bar Chart Section */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loadingIndicator} />
      ) : (
        chartData && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Static Y-Axis Labels */}
            <View style={styles.yAxisContainer}>
              {[...Array(6)].map((_, i) => (
                <Text key={i} style={styles.yAxisLabel}>
                  {Math.round((Math.max(...(showIncome ? chartData.incomeData : chartData.expenseData)) / 5) * (5 - i))}
                </Text>
              ))}
            </View>

            {/* Scrollable Chart */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{borderRadius:15 }}>
              <BarChart
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      data: showIncome ? chartData.incomeData : chartData.expenseData,
                    },
                  ],
                }}
                width={chartWidth} // Dynamic width based on data
                height={220}
                fromZero
                withHorizontalLabels={false} // Exclude horizontal labels (handled by static Y-axis)
                chartConfig={{
                  backgroundColor: '#e26a00',
                  backgroundGradientFrom: '#fb8c00',
                  backgroundGradientTo: '#ffa726',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  barPercentage: 0.5,
                }}
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    padding: 10,
  },
  headerContainer: {
    backgroundColor: Colors.PRIMARY,
    height: 75,
    borderRadius: 15,
    marginBottom: 10,
    paddingBottom:10,
    marginTop:30,
    justifyContent: 'center',
  },
  profileContainer: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontFamily: 'dosis-bold',
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'dosis-medium',
    color: Colors.GRAY,
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'dosis-bold',
    color: Colors.WHITE,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.LIGHT_GRAY,
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: Colors.PRIMARY,
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'dosis-medium',
    color: Colors.GRAY,
  },
  activeToggleText: {
    color: Colors.WHITE,
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    height: 220,
    paddingRight: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'dosis-medium',
    color: Colors.GRAY,
    textAlign: 'right',
  },
  chart: {
    borderRadius: 10,
    marginVertical: -2,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});
