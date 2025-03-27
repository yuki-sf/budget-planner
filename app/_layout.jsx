import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';


// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'delius':require('./../assets/fonts/Delius-Regular.ttf'),
    'sourGummy':require('./../assets/fonts/SourGummy-Regular.ttf'),
    'sourGummy-medium':require('./../assets/fonts/SourGummy_SemiExpanded-Medium.ttf'),
    'sourGummy-bold':require('./../assets/fonts/SourGummy-Bold.ttf'),
    'dosis':require('./../assets/fonts/Dosis-Regular.ttf'),
    'dosis-medium':require('./../assets/fonts/Dosis-Medium.ttf'),
    'dosis-bold':require('./../assets/fonts/Dosis-ExtraBold.ttf'),
  });
  const colorScheme = 'light';
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown:false }}>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='add-new-category' options={{
          presentation:'modal',
          headerShown:true,
          headerTitle:'Add New Category'
        }}/>
        <Stack.Screen name='add-new-category-item' options={{
          presentation:'modal',
          headerShown:true,
          headerTitle:'Add New Item'
        }}/>
        <Stack.Screen name='sms-reader' options={{
          presentation:'modal',
          headerShown:true,
          headerTitle:'SMS reader'
        }}/>
        <Stack.Screen name='add-income' options={{
          presentation:'modal',
          headerShown:true,
          headerTitle:'Add New Income'
        }}/>
        <Stack.Screen name='add-recurring-expense' options={{
          presentation:'modal',
          headerShown:true,
          headerTitle:'Add New Recurring Expense'
        }}/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
