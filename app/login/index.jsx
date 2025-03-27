import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import loginBg from './../../assets/images/loginbg.png'
import Colors from '../../utils/Colors'
import { client } from '../../utils/KindeConfig'
import services from '../../utils/services'


export default function LoginScreen() {

      const router = useRouter();    
      const handleSignIn = async () => {
        const token = await client.login();
        if (token) {
          // User was authenticated
          await services.storeData('login','true');
          router.replace('/');
        }
      };

  return (
    <View style={{
        marginLeft:15,
        marginRight:15
    }}>
     <Image source={loginBg} style={styles.bgImage} />
     <View style={{ 
        backgroundColor:Colors.PRIMARY,
        width:'100%',
        height:'100%',
        padding:20,
        borderTopLeftRadius:30,
        borderTopRightRadius:30,
     }}>
        <Text style={{ 
            fontSize:25,
            fontWeight: 'bold',
            textAlign: 'center',
            color:Colors.WHITE,
        }}>Expense Tracker</Text>
        <Text style={{ 
            fontSize:18,
            color:Colors.WHITE,
            textAlign: 'center',
            marginTop:20,
            marginBottom: 10,
        }}>Stay on Track, Event by Event: Your Personal Expense Tracker</Text>
        <TouchableOpacity style={styles.button}
        onPress={handleSignIn}>
            <Text style={{ 
                textAlign: 'center', 
                color:Colors.PRIMARY, 
                fontWeight:'bold'
            }}>Login/Signup</Text>
        </TouchableOpacity>
     </View>
    </View>
  )
}

const styles = StyleSheet.create({
    bgImage:{
        width:170,
        height:170,
        margin:100,
    },
    button:{
        backgroundColor: Colors.WHITE,
        padding:10,
        paddingHorizontal:5,
        borderRadius:20,
        borderWidth:2,
        borderColor:Colors.SECONDARY,
    },
    text:{
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffffff',
        marginBottom: 10,
        marginTop: 10
    },
});