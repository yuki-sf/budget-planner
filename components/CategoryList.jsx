import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../utils/Colors'
import { useRouter } from 'expo-router'

export default function CategoryList({categoryList}) {

    const router = useRouter()
    const onCategoryClick=(category)=>{
        router.push({
            pathname:'/category-detail',
            params:{
                categoryId:category.id
            }
        })
    }

    const calculateTotalCost = (categoryItems)=>{
        let totalCost=0;
        categoryItems?.forEach(item=>{totalCost+=item.cost})
        return totalCost;
    }
        

  return (
    <View style={{ marginTop:-5 }}>
      <View>
        {categoryList?.map((category,index)=>(
            <TouchableOpacity key={index} style={styles.container}
            onPress={()=>onCategoryClick(category)}>
                <View style={styles.iconContainer}>
                    <Text style={[styles.iconText,{backgroundColor:category.color}]}>{category.icon}</Text>
                </View>
                <View>
                    <View style={styles.subContainer}>
                        <Text style={styles.categoryText}>{category.name}</Text>
                        <View style={{display:'flex',
                        flexDirection:'row',
                        }}>
                            <Text style={styles.totalAmountText}>₹{calculateTotalCost(category?.CategoryItems)} / </Text>
                            <Text style={styles.totalAmountText}> ₹{category.assigned_budget}</Text>
                        </View>
                    </View>
                    <View style={{display:'flex',
                        flexDirection:'row'}}>
                        <Text style={[styles.itemCount, {flex:1}]}>{category?.CategoryItems?.length} Items</Text>
                        <Text style={[styles.totalText, {flex:2}]}>Remaining: 
                            <Text style={{fontFamily:'dosis-bold'}}>  ₹{category.assigned_budget-calculateTotalCost(category?.CategoryItems)}</Text></Text>
                    </View>
                </View>
            </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginTop:5,
        marginBottom:10,
        display: 'flex',
        flexDirection:'row',
        gap:10,
        backgroundColor:Colors.WHITE,
        padding:10,
        borderRadius:15,
        backgroundColor: Colors.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    categoryText:{
        fontFamily:'dosis-bold',
        fontSize:18,
    },
    itemCount:{
        fontFamily:'dosis',
        fontSize:14,
    },
    subContainer:{
        display: 'flex',
        flexDirection:'row',
        allignItems: 'center',
        justifyContent:'space-between',
        width:'88%',
        marginTop:6
    },
    iconContainer:{
        justifyContent: 'center',
        alignItems:'baseline',
    },
    iconText:{
        fontSize:25,
        padding:15,
        borderRadius:50,
        paddingHorizontal:17
    },
    totalAmountText:{
        paddingTop:2,
        fontFamily:'dosis-bold',
        fontSize:18,
    },
    totalText:{
        paddingRight:38,
        paddingTop:2,
        fontFamily:'dosis',
        fontSize:14,
        textAlign:'right',
    }
})