import { View, Text, StyleSheet, TouchableOpacity, Alert, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import Colors from '../../utils/Colors'
import { supabase } from '../../utils/SupabaseConfig'
import { useRouter } from 'expo-router'

export default function CourseInfo({categoryData}) {

    const router = useRouter()
    const [totalCost,setTotalCost] = useState()
    const [percTotal, setPercTotal] = useState(0)
    useEffect(()=>{
        categoryData&&calculateTotalPerc()
    },[categoryData])

    const calculateTotalPerc=()=>{
        let total=0;
        categoryData?.CategoryItems?.forEach(item=>{total+=item.cost});
        setTotalCost(total);
        let perc= (total/categoryData?.assigned_budget)*100;
        if (perc > 100){
            perc=100;
            let extra = total - categoryData?.assigned_budget
            Alert.alert("Over Bugdet", "You went over Budget by ₹"+extra)
        }
        setPercTotal(perc);
    }

    const cancelHandle = () =>
        ToastAndroid.show('Canceled . . .', ToastAndroid.SHORT)

    const deleteRow = async (categoryData) => {
        const categoryId = categoryData?.id
        console.log("try:",categoryId)
        try {
            const {error} = await supabase.from('CategoryItems').delete().eq('category_id',categoryId);
            await supabase.from('Category').delete().eq('id',categoryId);
            if (error) {
                console.log('Error deleting category:', error);
                ToastAndroid.show('Failed to delete the category.', ToastAndroid.SHORT)
            } else {
                ToastAndroid.show('Category deleted successfully!', ToastAndroid.SHORT)
                router.replace('/')
            }
        } catch (err) {
            console.log('Unexpected error:', err);
            ToastAndroid.show('An Unexpected Error Occured.', ToastAndroid.SHORT)
        }
    }

    const confirmDelete=()=>{
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
              { text: 'Cancel', style: 'cancel' , onPress: ()=> cancelHandle()},
              { text: 'Delete', style: 'destructive', onPress: () => deleteRow(categoryData) },
            ]
          );
    }

  return (
    <View>
        <View style={styles.mainContainer}>
            <View style={styles.iconContainer}>
                <Text style={[styles.textIcon,{backgroundColor:categoryData?.color
                }]}>{categoryData?.icon}</Text>
            </View>
            <View style={{flex:1, marginLeft:20}}>
                <Text style={styles.categoryName}>{categoryData?.name}</Text>
                <Text style={styles.categoryItemText}>{categoryData?.CategoryItems?.length} Item</Text>
            </View>
            <TouchableOpacity onPress={confirmDelete}>
                <Ionicons name="trash" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
        </View>
        <View style={styles.amountContainer}>
            <Text style={{fontFamily:'dosis', fontSize:17}}>₹{totalCost}</Text>
            <Text style={{fontFamily:'dosis', fontSize:17}}>Total Budget: ₹{categoryData.assigned_budget}</Text>
        </View>
        <View style={styles.progressBar}>
            <View style={percTotal==100?[styles.fullProgressBarSubContainer,{width:percTotal+'%'}]:[styles.progressBarSubContainer,{width:percTotal+'%'}]}>

            </View>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    textIcon:{
        padding:15,
        borderRadius:50,
        paddingHorizontal:18,
        fontSize:38
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems:'baseline',
        marginTop:0
    },
    mainContainer:{
        marginTop:15,
        display:'flex',
        flexDirection:'row',
        gap:10,
        justifyContent:'space-between',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
    },
    categoryName:{
        fontFamily:'dosis-medium',
        fontSize:24,
    },
    categoryItemText:{
        fontFamily:'dosis-medium',
        fontSize:18,
    },
    amountContainer:{
        display: 'flex',
        justifyContent:'space-between',
        flexDirection: 'row',
        marginTop:10,
        marginRight:1,
    },
    progressBar:{
        width:'100%',
        height:10,
        backgroundColor:Colors.GRAY,
        borderRadius:99,
        marginTop:10,
    },
    progressBarSubContainer:{
        height:10,
        backgroundColor:Colors.PRIMARY,
        borderRadius:99,
    },
    fullProgressBarSubContainer:{
        height:10,
        backgroundColor:Colors.RED,
        borderRadius:99,
    }
})