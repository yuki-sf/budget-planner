import { View, Text, Button, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Link,useRouter } from 'expo-router'
import services from './../../utils/services'
import { client } from './../../utils/KindeConfig'
import { supabase } from './../../utils/SupabaseConfig'
import Header from '../../components/Header'
import Colors from './../../utils/Colors'
import CircularChart from '../../components/CircularChart'
import { Ionicons } from '@expo/vector-icons'
import CategoryList from '../../components/CategoryList'

export default function Home() {

    const router = useRouter();
    const profileView = false;
    const [categoryList, setCategoryList] = useState();
    const [loading,setLoading] = useState(false);
    useEffect(() =>{
        checkUserAuth();
        getCategoryList();
    },[]);

    const checkUserAuth=async()=>{
        const result=await services.getData('login');
        if(result!=='true'){
            router.replace("/login");
        }
    }

    const handleLogout = async () => {
      
        const loggedOut = await client.logout();
        if (loggedOut) {
          // User was logged out
          await services.storeData('login','false');
          router.replace('/login');
        }
      };

    const getCategoryList = async () => {
      setLoading(true);
      const user = await client.getUserDetails();
      const {data,error} = await  supabase.from('Category')
      .select('*,CategoryItems(*)')
      .eq('created_by',user.email);

      setCategoryList(data);
      data&&setLoading(false);
    }

  return (
    <View style={{
      marginTop:25,
      flex:1,
      backgroundColor:Colors.LIGHT_GRAY,
    }}>  
        <View style={{
            marginLeft:10,
            marginRight:10,
            backgroundColor:Colors.PRIMARY,
            height:75,
            borderRadius:15,
            marginTop:12
        }}>
        <Header handleLogout={handleLogout} profileView={profileView}/>
        </View>
        <View style={{
          marginLeft:10,
          marginRight:10,
          marginTop:-10,
          borderRadius:15
        }}>
        <CircularChart categoryList={categoryList}/>
        <View style={{padding:10}}>
        <Text style={{ fontFamily:'dosis-bold', fontSize:20, marginTop:2,}}>Latest Budget</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}
        style={{ marginBottom:185} }
      refreshControl={
        <RefreshControl 
        onRefresh={()=>getCategoryList()}
        refreshing={loading}/>
      }>
        <View style={{marginBottom:260}}>
          <CategoryList categoryList={categoryList}/>
        </View>
        </ScrollView>
        </View>

      <Link href={'/add-new-category'} style={styles.addBtnContainer}> 
        <Ionicons name="add-circle" size={64} color={Colors.PRIMARY} />
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
    text:{
        fontSize: 20
    },
    addBtnContainer:{
      position:'absolute',
      left:304,
      bottom:16,
      borderRadius: 50,
      backgroundColor: Colors.WHITE
    }

    // container: {
    //     flex: 1,
    //     backgroundColor: '#fff',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
})