// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Image } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultProfileImage = 'https://oodp.ca/media/tutor-8.jpg';

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('Chargement');
  const [email, setEmail] = useState('Chargement');
  const [profileImage, setProfileImage] = useState(defaultProfileImage); // Utiliser l'image par défaut

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Fetching user data...');
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        console.log('Stored email:', storedEmail); // Vérifiez si l'email est bien récupéré

        if (storedEmail) {
          setEmail(storedEmail);
          const response = await fetch(`http://192.168.68.107/api.php?action=getUser&email=${storedEmail}`);

          console.log('Response status:', response.status); // Vérifiez le statut de la réponse
          if (!response.ok) {
            console.error('Error fetching user data:', response.statusText);
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          console.log('User data fetched:', data); // Affichez les données de l'utilisateur

          if (data && data.user) {
            setUsername(data.user.username);
            if (data.user.profileImage) {
              setProfileImage(data.user.profileImage);
            } else {
              setProfileImage(defaultProfileImage); // Utiliser l'image par défaut
            }
          } else {
            console.error('Username not found in response:', data);
          }
        } else {
          console.error('No email found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: profileImage }} style={styles.profileImage} />
      <Text h3>{username}</Text>
      <Text>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});
