import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Colors from './../utils/Colors';
import ColorPicker from '../components/ColorPicker';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../utils/SupabaseConfig';
import { client } from '../utils/KindeConfig';
import { useRouter } from 'expo-router';

export default function AddNewCategory() {
    const [selectedIcon, setSelectedIcon] = useState('😊');
    const [selectedColor, setSelectedColor] = useState(Colors.RED);
    const [loading, setLoading] = useState(false);

    const [categoryName, setCategoryName] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [remainingIncome, setRemainingIncome] = useState(0);
    const [warningMessage, setWarningMessage] = useState('');
    const [availableIncome, setAvailableIncome] = useState(0); // To store the available income for allocation

    const router = useRouter();

    // Fetch the monthly income from Supabase
    useEffect(() => {
        const fetchIncome = async () => {
            const user = await client.getUserDetails();
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;

            const { data, error } = await supabase
                .from('monthly_finances')
                .select('remaining_income')
                .eq('user_mail', user.email)
                .eq('month', month)
                .eq('year', year)
                .single();

            if (error) {
                console.error('Error fetching remaining income:', error);
                ToastAndroid.show('Error fetching income.', ToastAndroid.SHORT);
            } else {
                const remainingIncome = data ? data.remaining_income : 0;
                setAvailableIncome(remainingIncome); // Set the available income
                setRemainingIncome(remainingIncome);
            }
        };

        fetchIncome();
    }, []);

    // Real-time update of remaining income after entering the budget
    useEffect(() => {
        const updateRemainingIncome = async () => {
            if (totalBudget && !isNaN(totalBudget)) {
                const remaining = availableIncome - parseFloat(totalBudget);
                setRemainingIncome(remaining);

                if (remaining < 0) {
                    setWarningMessage('Warning: You are exceeding your available income!');
                } else {
                    setWarningMessage('');
                }
            }
        };

        updateRemainingIncome();
    }, [totalBudget, availableIncome]); // Re-run whenever totalBudget or availableIncome changes

    const onCreateCategory = async () => {
        setLoading(true);
        const user = await client.getUserDetails();
        try {
            // Check if the budget exceeds the remaining income
            if (parseFloat(totalBudget) > remainingIncome) {
                setLoading(false);
                ToastAndroid.show('You cannot allocate more than your available income!', ToastAndroid.SHORT);
                return;
            }

            // Insert category into the database
            const { data, error } = await supabase.from('Category').insert([{
                name: categoryName,
                assigned_budget: totalBudget,
                icon: selectedIcon,
                color: selectedColor,
                created_by: user.email,
            }]).select();

            if (error) {
                setLoading(false);
                ToastAndroid.show('Error creating category!', ToastAndroid.SHORT);
                console.error('Error creating category:', error);
                return;
            }

            // After inserting the category, get its ID and update monthly finances
            const categoryId = data[0].id; // Get the created category's ID

            // Update the monthly finances table to subtract the category budget from remaining income and add it to monthly expenses
            const { data: monthlyData, error: monthlyError } = await supabase
                .from('monthly_finances')
                .select('remaining_income, monthly_expense')
                .eq('user_mail', user.email)
                .eq('month', new Date().getMonth() + 1)
                .eq('year', new Date().getFullYear())
                .single(); // Get the current month's data

            if (monthlyError) {
                setLoading(false);
                ToastAndroid.show('Error fetching monthly finances!', ToastAndroid.SHORT);
                console.error('Error fetching monthly finances:', monthlyError);
                return;
            }

            if (monthlyData) {
                const newRemainingIncome = monthlyData.remaining_income - parseFloat(totalBudget);
                const newMonthlyExpenses = monthlyData.monthly_expense + parseFloat(totalBudget);

                // Update the monthly finances table
                const { error: updateError } = await supabase
                    .from('monthly_finances')
                    .update({
                        remaining_income: newRemainingIncome,
                        monthly_expense: newMonthlyExpenses,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_mail', user.email)
                    .eq('month', new Date().getMonth() + 1)
                    .eq('year', new Date().getFullYear());

                if (updateError) {
                    setLoading(false);
                    ToastAndroid.show('Error updating monthly finances!', ToastAndroid.SHORT);
                    console.error('Error updating monthly finances:', updateError);
                    return;
                }

                // After updating monthly finances, navigate to the category details page
                router.replace({
                    pathname: '/category-detail',
                    params: { categoryId: categoryId },
                });

                setLoading(false);
                ToastAndroid.show('Category Created and Finances Updated!', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setLoading(false);
            ToastAndroid.show('Error creating category!', ToastAndroid.SHORT);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <TextInput
                    style={[styles.iconInput, { backgroundColor: selectedColor }]}
                    maxLength={2}
                    onChangeText={(value) => setSelectedIcon(value)}
                >
                    {selectedIcon}
                </TextInput>

                <ColorPicker
                    selectedColor={selectedColor}
                    setSelectedColor={(color) => setSelectedColor(color)}
                />
            </View>

            <View style={styles.inputView}>
                <MaterialIcons name="local-offer" size={24} color={selectedColor} />
                <TextInput
                    placeholder="Category Name"
                    onChangeText={(value) => setCategoryName(value)}
                    style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
                />
            </View>

            <View style={styles.inputView}>
                <MaterialIcons name="currency-rupee" size={24} color={selectedColor} />
                <TextInput
                    placeholder="Total Budget"
                    keyboardType="numeric"
                    onChangeText={(value) => setTotalBudget(value)}
                    style={{ width: '100%', fontSize: 17, fontFamily: 'delius' }}
                />
            </View>

            {/* Show available income and remaining income */}
            <View style={styles.incomeContainer}>
                <Text style={styles.incomeText}>Total Available Income: ₹{availableIncome}</Text>
                <Text style={styles.incomeText}>Remaining Income after Allocation: ₹{remainingIncome}</Text>
            </View>

            {warningMessage ? (
                <Text style={{ color: Colors.RED, fontFamily: 'delius', marginTop: 10 }}>{warningMessage}</Text>
            ) : null}

            <TouchableOpacity
                style={styles.button}
                disabled={!categoryName || !totalBudget || loading}
                onPress={onCreateCategory}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.WHITE} />
                ) : (
                    <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.WHITE, fontFamily: 'delius' }}>
                        Create
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        padding: 20,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconInput: {
        textAlign: 'center',
        fontSize: 30,
        fontFamily: 'delius',
        padding: 20,
        borderRadius: 99,
        paddingHorizontal: 21,
        color: Colors.WHITE,
    },
    inputView: {
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: 5,
        padding: 10,
        borderRadius: 10,
        borderColor: Colors.GRAY,
        backgroundColor: Colors.WHITE,
        alignItems: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: Colors.PRIMARY,
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        width: '100%',
    },
    incomeContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: Colors.LIGHT_GRAY,
        borderRadius: 10,
    },
    incomeText: {
        fontSize: 18,
        fontFamily: 'delius-bold',
        color: Colors.BLACK,
    },
});
