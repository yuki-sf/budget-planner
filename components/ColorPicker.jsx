import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import Colors from '../utils/Colors'

export default function ColorPicker({selectedColor,setSelectedColor}) {
  return (
    <View style={{
        display:'flex',
        flexDirection:'row',
        gap:20,
        marginTop:10,
        borderRadius:99,
        backgroundColor:Colors.LIGHT_GRAY
    }}>
      <ScrollView horizontal
      showsHorizontalScrollIndicator={false} style={{borderRadius:99}}>
      {Colors.COLOR_LIST.map((color,index)=>(

        <TouchableOpacity
        key={index}
        style={[{
            height:30,
            width:30,
            backgroundColor:color,
            borderRadius:99,
            marginTop:10,
            marginHorizontal:10,
            marginBottom:10
        },selectedColor==color&&{borderWidth:4}]}
        onPressIn={()=>setSelectedColor(color)}>

        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  )
}