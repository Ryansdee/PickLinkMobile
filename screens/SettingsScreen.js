import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('Inconnu'); // Valeur par défaut
  const [email, setEmail] = useState('Inconnu'); // Valeur par défaut

  const handleLogout = async () => {
    try {
      // Supprimer l'email et toute autre donnée d'utilisateur stockée
      await AsyncStorage.removeItem('email');
      // Rediriger vers l'écran de connexion ou d'accueil
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Assurez-vous que ce nom d'écran est correct
      });
      Alert.alert("Déconnexion réussie", "Vous avez été déconnecté avec succès.");
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la déconnexion.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email'); // Récupérer l'email stocké
        if (storedEmail) {
          setEmail(storedEmail); // Mettre à jour l'email

          // Récupérer le nom d'utilisateur à partir de l'API
          const response = await fetch(`http://192.168.68.107/api.php?action=getUser&email=${storedEmail}`);
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json(); // Tenter de convertir la réponse en JSON
          
          if (data && data.user && data.user.username) {
            setUsername(data.user.username); // Mettre à jour le nom d'utilisateur
          } else {
            console.error('Username not found in response:', data);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil de l'utilisateur</Text>
      <Text style={styles.infoText}>Nom: {username}</Text>
      <Text style={styles.infoText}>Email: {email}</Text>
      <Button
        title="Se déconnecter"
        onPress={handleLogout} // Assure que handleLogout est appelé
        color="red" // Couleur rouge pour le bouton de déconnexion
      />
    </View>
  );
}

// Styles pour la mise en page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // Fond blanc
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginVertical: 10,
  },
});
