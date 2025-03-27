import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Linking, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import Colors from '../../utils/Colors'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '../../utils/SupabaseConfig'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { openURL } from 'expo-linking'
import { nodeModuleNameResolver } from 'typescript'

export default function CourseItemList({categoryData}) {

    const [expandItem, setExpandItem] = useState()

    const router = useRouter()
    const { categoryId } = useLocalSearchParams()

    const openURL = (url) => {
        if (url) {
            Linking.openURL(url);
        }
    }

    const noURL = () => {
        ToastAndroid.show('No URL Available', ToastAndroid.SHORT)
    }

    const cancelHandle = () => {
        ToastAndroid.show('Canceled . . .', ToastAndroid.SHORT) 
    }

    const deleteRow = async (id) => {
        console.log("try:",id?.id)
        try {            
            const { error } = await supabase
            .from('CategoryItems')
            .delete()
            .eq('id', id?.id)
        
            if (error) {
                console.log('Error deleting category:', error);
                ToastAndroid.show('Failed to delete the item', ToastAndroid.SHORT)
            } else {
                Alert.alert('Success', 'Category deleted successfully.');
                ToastAndroid.show('Category deleted successfully!', ToastAndroid.SHORT)
                router.replace({pathname:'/category-detail',
                    params:{
                        categoryId:categoryId
                    }
                })
            }
        } catch (err) {
            console.log('Unexpected error:', err);
            ToastAndroid.show('An Unexpected Error Occured.', ToastAndroid.SHORT)
        }
    }

    const confirmDelete=(item)=>{
        console.log(item)
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => cancelHandle() },
              { text: 'Delete', style: 'destructive', onPress: () => deleteRow(item) },
            ]
          );
    }

  return (
    <View style={styles.container}>
        <View style={{marginTop:-35}}>
            {categoryData?.CategoryItems?.length>0?categoryData?.CategoryItems?.map((item,index)=>(
                <>
                <TouchableOpacity onLongPress={()=>confirmDelete(item)} onPress={()=>setExpandItem(index)}>
                <View key={index} style={styles.itemContainer}>
                    <Image source={{uri:item.image}} style={styles.image}/>
                    <View style={{flex:1, marginLeft:10, marginRight:10}}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.note} numberOfLines={2}>{item.note}</Text>
                    </View>
                    <Text style={styles.cost}>₹{item.cost}</Text>
                </View>
                </TouchableOpacity>
                {expandItem==index&&
                <View >
                    {item.url?
                    <TouchableOpacity onPress={()=>openURL(item.url)} style={styles.actionItemContainer}>
                        <FontAwesome name="external-link" size={24} color="black" />
                        <Text style={{}}>{item.url}</Text>
                    </TouchableOpacity>:
                    noURL()
                    }
                </View>}
                {categoryData?.CategoryItems?.length-1!=index&& 
                <View style={{borderWidth:0.5, marginTop:10, borderColor:Colors.GRAY}}>
                </View>
                }
                </>
            )):
            <Text style={styles.noItemText}>No Item Found</Text>}
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginTop:20,
    },
    image:{
        width:90,
        height:90,
        borderRadius:10,
        backgroundColor:Colors.GRAY
    },
    itemContainer:{
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        marginBottom:5,
        marginTop:13,
        marginLeft:-10,
        alignItems: 'center',
    },
    name:{
        fontFamily:'dosis-bold',
        marginTop:-15,
        margin:5,
        fontSize:18
    },
    url:{
        fontFamily:'dosis',
        marginLeft:5,
        marginRight:5,
        fontSize:15,
    },
    cost:{
        fontFamily:'dosis-bold',
        fontSize:16,
    },
    noItemText:{
        fontFamily:'dosis-bold',
        fontSize:25,
        marginTop:20,
        textAlign:'center',
        color:Colors.GRAY,
    },
    actionItemContainer:{
        display:'flex',
        flexDirection:'row',
        gap:10,
        justifyContent:'flex-start',
        marginBottom:5,
        marginTop:10,
        marginLeft:10,
    }
})