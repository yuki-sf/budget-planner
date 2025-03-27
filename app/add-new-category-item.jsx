import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Feather from '@expo/vector-icons/Feather'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Colors from '../utils/Colors'
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/SupabaseConfig'
import { decode } from 'base64-arraybuffer'
import { useLocalSearchParams, useRouter } from 'expo-router'

const placeholder = 'https://static.thenounproject.com/png/4595376-200.png'
export default function AddNewCategoryItem() {
    const router = useRouter()

    const [image, setImage] = useState(placeholder)
    const [previewImage, setPreviewImage] = useState(placeholder)
    const {categoryId} = useLocalSearchParams()
    const [name, setName] = useState()
    const [cost, setCost] = useState()
    const [url, setUrl] = useState()
    const [note, setNote] = useState()
    const [loading, setLoading] = useState(false)

    const onImagePick = async() => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64:true
        });

        if (!result.canceled) {
            setPreviewImage(result.assets[0].uri);
            setImage(result.assets[0].base64);
        }
    }

    const onClickAdd = async()=>{
        setLoading(true);
        const fileName = Date.now();
        const {data,error} = await supabase
        .storage
        .from('images')
        .upload(fileName+'.png', decode(image), {
            contentType: 'image/png'
        });

        if(data) {
            const fileUrl = "https://mkshvqbzmamtkijkklik.supabase.co/storage/v1/object/public/images/"+fileName+".png";


            const {data,error} = await supabase.from('CategoryItems')
            .insert([{ 
                name: name, 
                cost:cost, 
                url:url, 
                note:note, 
                image:fileUrl, 
                category_id:categoryId 
            }]).select();
            ToastAndroid.show('New Item Added!', ToastAndroid.SHORT);
            setLoading(false);
            router.back();      //using 2 back to prevent stacking of the categoryList page.
            router.back();      //replace not working thus removing the previous state and pushing the new state.
            router.push({
                pathname:'/category-detail',
                params:{
                    categoryId:categoryId
                }
            })
        }
        
    }


  return (
    <KeyboardAvoidingView>
        <ScrollView style={{padding:20, backgroundColor:Colors.WHITE, borderRadius:30 }}>
            <TouchableOpacity onPress={()=> onImagePick()}>
                <Image source={{uri:previewImage}} style={styles.image}/>
            </TouchableOpacity>
            <View style={styles.textInputContainer}>
                <Ionicons name="pricetag" size={24} color={Colors.GRAY} marginLeft={6} />
                <TextInput placeholder='Item Name' style={styles.input} onChangeText={(value)=>setName(value)}/>
            </View>
            <View style={styles.textInputContainer}>
                <FontAwesome6 name="indian-rupee-sign" size={24} color={Colors.GRAY} marginLeft={12} />
                <TextInput placeholder='Cost' keyboardType='numeric' style={[styles.input,{paddingLeft:8}]} onChangeText={(value)=>setCost(value)}/>
            </View>
            <View style={styles.textInputContainer}>
                <Feather name="link-2" size={24} color={Colors.GRAY} marginLeft={8}/>
                <TextInput placeholder='URL' style={styles.input} onChangeText={(value)=>setUrl(value)}/>
            </View>
            <View style={styles.textInputContainer}>
                <MaterialIcons name="edit-note" size={24} color={Colors.GRAY} marginLeft={10}/>
                <TextInput placeholder='Note' style={styles.input} multiline numberOfLines={3} onChangeText={(value)=>setNote(value)}/>
            </View>
            <TouchableOpacity style={styles.button} disabled={!name||!cost||loading} onPress={()=>onClickAdd()}>
                {loading?
                <ActivityIndicator color={Colors.WHITE}/>:
                <Text style={{textAlign: 'center', fontFamily: 'dosis-bold', fontSize:16, color:Colors.WHITE }}>Add</Text>
                }
            </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    image:{
    width:150,
    height:150,
    backgroundColor:Colors.GRAY,
    borderRadius:15
    },
    textInputContainer:{
        padding:10,
        borderWidth:1,
        borderColor:Colors.GRAY,
        borderRadius:15,
        marginTop:10,
        gap:10,
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:Colors.WHITE,
        paddingLeft:5,
        paddingRight:10,
    },
    input:{
        width:'100%',
        fontSize:17,
        paddingRight:50,
        fontFamily:'dosis-medium'
    },
    button:{
        padding:15,
        marginTop:25,
        backgroundColor:Colors.PRIMARY,
        borderRadius:15,
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
    }
})