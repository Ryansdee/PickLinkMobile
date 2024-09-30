import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterScreen from './screens/RegisterScreen'; // Ajustez le chemin
import LoginScreen from './screens/LoginScreen'; // Ajustez le chemin
import HomeScreen from './screens/HomeScreen'; // Ajustez le chemin
import ProfileScreen from './screens/ProfileScreen'; // Ajustez le chemin
import SettingsScreen from './screens/SettingsScreen'; // Ajustez le chemin
import MessagesScreen from './screens/MessagesScreen'; // Ajustez le chemin
import PostScreen from './screens/PostScreen'; // Ajustez le chemin
import SearchScreen from './screens/SearchScreen'; // Ajustez le chemin
import { AuthProvider } from './screens/AuthProvider'; // Assurez-vous que ce chemin est correct
import ChatScreen from './screens/ChatScreen'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        tabBarActiveTintColor: '#4cb5cf', 
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#000a14',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabel: () => null,
      }}
    >
      <Tab.Screen 
        name="PickLink" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Chercher" 
        component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Post" 
        component={PostScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-sharp" color={color} size={size} />
          ),
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cog-sharp" color={color} size={size} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // État pour gérer le statut de connexion

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true'); // Mettre à jour l'état de connexion
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    // En attendant la vérification de l'état de connexion
    return null; // Vous pourriez vouloir afficher un écran de chargement ici
  }

  return (
    <AuthProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isLoggedIn ? "PickLink" : "Login"}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="PickLink" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
