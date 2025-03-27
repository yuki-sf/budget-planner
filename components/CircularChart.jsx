import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import PieChart from 'react-native-pie-chart'
import { server } from 'typescript'
import Colors from '../utils/Colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'


export default function CircularChart({categoryList}) {
    const widthAndHeight=150;
    const [values,setValues] = useState([1]);
    const [sliceColor,setSliceColor] = useState([Colors.GRAY]);
    const [totalCalcEstimate,setTotalCalcEstimate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() =>{
            updateCircularChart();
        },5000);                                //applied delay of 1 seconds to prevent crashing of app for not recieving data
        return () => clearTimeout(timer);
    },[categoryList])

    const updateCircularChart= async () => {
        setLoading(true);
        setSliceColor([])
        setValues([])
        let totalEstimate = 0;
        let otherCost = 0;
            categoryList?.forEach((item, index) => {

                if (index<4){
                    let itemTotalCost=0;
                    item.CategoryItems?.forEach((item_)=>{
                        itemTotalCost += item_.cost;
                        totalEstimate += item_.cost;
                    })
                    setSliceColor(sliceColor=>[...sliceColor,Colors.COLOR_LIST[index]])
                    setValues(values=>[...values,itemTotalCost])
                } else {
                    item.CategoryItems?.forEach((item_)=>{
                        otherCost += item_.cost;
                        totalEstimate += item_.cost;
                    })
                }
            })
            if (otherCost > 0) {
                setSliceColor(sliceColor=>[...sliceColor,Colors.COLOR_LIST[4]])
                setValues(values=>[...values,otherCost])
            }
            setLoading(false);
            setTotalCalcEstimate(totalEstimate);
        }

  return (
    <View style={styles.container}>
        <Text style={{ 
            fontSize:20,
            marginTop:-10,
            marginBottom:5,
            fontFamily:'dosis-medium'
        }}>Total Estimation: <Text style={{fontFamily:'dosis-bold'}}>₹{totalCalcEstimate}</Text></Text>
        <View style={styles.subContainer}>
            <PieChart
                widthAndHeight={widthAndHeight}
                series={values}
                sliceColor={sliceColor}
                coverRadius={0.6}
                coverFill={'#FFF'}
            />
            {categoryList?.length==0?
            <View style={styles.chartNameContainer}>
                <MaterialCommunityIcons name="checkbox-blank-circle" size={24} color={Colors.GRAY} />
                <Text style={{fontFamily:'dosis-medium'}}>NA</Text>
            </View>:
            <View>
                {categoryList?.map((category,index)=>index<=4&&(
                <View style={styles.chartNameContainer} key={index}>
                    <MaterialCommunityIcons name="checkbox-blank-circle" size={24} color={Colors.COLOR_LIST[index]} />
                    <Text style={{fontFamily:'dosis-medium'}}>{ index<4?category.name:'Others'}</Text>
                </View>
                ))}
            </View>
            }
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginTop:20,
        backgroundColor:Colors.WHITE,
        padding:20,
        borderRadius:15,
        elevation:1,
        backgroundColor: Colors.WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    subContainer:{
        marginTop:10,
        display:'flex',
        flexDirection:'row',
        gap:40
    },
    chartNameContainer:{
        paddingTop:4,
        display:'flex',
        flexDirection:'row',
        gap:5,
        alignItems:'center'
    },
})