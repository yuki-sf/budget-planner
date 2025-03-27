import { View, Text } from 'react-native'
import { Stack } from 'expo-router';
import React from 'react'
import {Tabs} from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'
import Colors from '../../utils/Colors'
export default function TabLayout() {
    return (
        <Stack screenOptions={{ headerShown:false }}>
            <Stack.Screen
            name="index"
            options={{
                title:"Home",
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
            }}
            />
        </Stack>
            
    )
}