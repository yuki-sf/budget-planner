import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { client } from '../utils/KindeConfig';
import Colors from '../utils/Colors';
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useSegments } from 'expo-router';

export default function Header({handleLogout,profileView}) {
    const [ user,setUser ] = useState();
    const router = useRouter();
  
    const segments = useSegments();

    useEffect(()=>{
        getUserData();
    })

    const goToProfile = () => {
        if (profileView === true) {
            router.replace('/');
        }
        if (profileView === false) {
            router.replace('/');
            router.push('/profile');
        }
    }

    const goToHome = () => {

    }

    const tryLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Yes', onPress: () => handleLogout() },
                { text: 'No', style: 'cancel' }
            ]
        )
    }

    const getUserData = async() => {
        const user = await client.getUserDetails();
        setUser(user);
    }
  return (
    <View style={{ 
        display:'flex',
        flexDirection:'row',
        gap:8,
        alignItems:'center',
        paddingLeft: 10,
        paddingTop:10
    }}>
        <TouchableOpacity onPress={() => goToProfile()}>
      <Image source={{uri:user?.picture}}
      style={{
        width:50,
        height:50,
        borderRadius:50
        }}/>
        </TouchableOpacity>
        <View style={{ 
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'space-between',
            width:'80%'
        }}>
            <View style={{paddingLeft:5}}>
                <Text style={{color:Colors.WHITE,fontSize:17, fontFamily:'dosis-medium'}}>Welcome, </Text>
                <Text style={{color:Colors.WHITE,fontSize:23, fontFamily:'dosis-bold'}}>{user?.given_name}</Text>
            </View>
            <TouchableOpacity onPress={tryLogout}>
                <MaterialCommunityIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
        </View>
    </View>
  )
}