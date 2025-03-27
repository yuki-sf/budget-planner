import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../utils/SupabaseConfig'
import Ionicons from '@expo/vector-icons/Ionicons'
import Colors from '../utils/Colors'
import CourseInfo from '../components/CourseDetail/CourseInfo'
import CourseItemList from '../components/CourseDetail/CourseItemList'

export default function CategoryDetails() {
    const router = useRouter()
    const [loading,setLoading] = useState(false);
    const {categoryId} = useLocalSearchParams()
    const [categoryData,setCategoryData] = useState([]);

    useEffect(()=> {
        categoryId&&getCategoryDetail()
    },[categoryId]);

    const getCategoryDetail=async()=>{
        const {data,error}=await supabase.from('Category')
        .select('*,CategoryItems(*)')
        .eq('id',categoryId)
        setCategoryData(data[0])
    }


  return (
    <View style={{ padding:10 }}>
        <View style={{ padding:10, marginBottom:5, backgroundColor:Colors.WHITE, borderRadius:30}}>
        <TouchableOpacity onPress={()=>router.replace('/(tabs)')} style={{ width:'20%' }}>
            <Ionicons name="arrow-back-circle" size={50} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <CourseInfo categoryData={categoryData} />
        <Text style={styles.heading}>Item List</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom:188,  borderRadius:30}} refreshControl={
        <RefreshControl 
        onRefresh={()=>getCategoryDetail()}
        refreshing={loading}/>
      }>
            <View style={{ marginTop:5, padding:20,  backgroundColor:Colors.WHITE, borderRadius:30 }} marginBottom={100}>
            <CourseItemList categoryData={categoryData} />
            </View>
        </ScrollView>
    <Link href={{
            pathname: '/add-new-category-item',
            params:{
                categoryId: categoryData.id
            }
        }} style={styles.floatingBtn}>
            <Ionicons name="add-circle" size={64} color={Colors.PRIMARY} />
        </Link>
    </View>
  )
}

const styles = StyleSheet.create({
    heading:{
        fontFamily:'dosis-bold',
        fontSize:20,
        paddingTop:10,
        textAlign: 'center'
    },
    floatingBtn:{
        position: 'absolute',
        top: 677,
        right: 16,
        borderRadius: 50,
        backgroundColor: Colors.WHITE
    }
})
