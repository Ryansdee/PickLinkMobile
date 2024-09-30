import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const backgroundImage = { uri: 'https://i.ibb.co/RyzKMdm/Design-sans-titre-1.png' };

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState(''); // État pour le nom d'utilisateur
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://192.168.68.107/api.php?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const responseText = await response.text(); 
      console.log("Response text:", responseText);  

      if (!response.ok) {
        console.error('Error response:', responseText);
        throw new Error('Une erreur est survenue lors de l\'inscription.');
      }

      const data = JSON.parse(responseText);

      if (!data.error) {
        // Sauvegarder l'email et le nom d'utilisateur après une inscription réussie
        await AsyncStorage.setItem('username', username); // Stockage du nom d'utilisateur
        await AsyncStorage.setItem('email', email); // Stockage de l'email

        Alert.alert('Succès', 'Inscription réussie, vous allez être redirigé vers l\'accueil.');
        navigation.navigate('PickLink'); // Naviguer vers l'écran d'accueil avec les tabs
      } else {
        Alert.alert('Erreur', data.message || 'Inscription échouée');
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title="S'inscrire" onPress={signUp} />
        )}
        {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        <Text style={{ marginVertical: 10, textAlign: 'center' }}>
          Déjà un compte ?
        </Text>
        <Button title="Se connecter" onPress={() => navigation.navigate('Login')} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fond blanc semi-transparent
    borderRadius: 10,
    elevation: 5, // Pour Android, ombre
    shadowColor: '#000', // Pour iOS, ombre
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
