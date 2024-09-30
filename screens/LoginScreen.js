import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundImage = { uri: 'https://i.ibb.co/RyzKMdm/Design-sans-titre-1.png' }; // Replace with your background image

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState('');

  const loginUser = async (username, password) => {
    try {
        const response = await fetch('http://192.168.68.107/api.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();
        if (result.success) {
            // Stocker les informations d'authentification
            await AsyncStorage.setItem('authToken', result.token); // Remplacez 'result.token' par la clé réelle
            // Rediriger ou mettre à jour l'état de l'application
        } else {
            Alert.alert('Erreur', result.error || 'Une erreur est survenue.');
        }
    } catch (error) {
        console.log('Erreur lors de la connexion:', error);
        Alert.alert('Erreur', 'Erreur lors de la connexion.');
    }
};

  const handleLogin = async () => {
    setLoading(true); // Start loading
    setError(''); // Reset error message

    try {
      const response = await fetch('http://192.168.68.107/api.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.message) {
        // Store email in AsyncStorage
        await AsyncStorage.setItem('email', email);
        Alert.alert("Login Successful", data.message);
        // Navigate to profile or other screen
        navigation.navigate('PickLink');
      } else {
        // Show error if login failed
        setError(data.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#841584" />
        ) : (
          <Button title="Se connecter" onPress={handleLogin} color="#841584" /> // Corrected to handleLogin
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.registerPrompt}>
          Pas encore de compte ?
        </Text>
        <Button title="S'inscrire" onPress={() => navigation.navigate('Register')} color="#841584" />
      </View>
    </ImageBackground>
  );
}

// Styles for layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    borderRadius: 10,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  registerPrompt: {
    marginVertical: 10,
    textAlign: 'center',
  },
});
