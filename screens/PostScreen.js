import React, { useState } from 'react';
import { Button, View, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const App = () => {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState('');

  const uploadImage = async (uri) => {
    if (!uri) {
      Alert.alert("Erreur", "L'URI de l'image est introuvable.");
      return;
    }

    const info = await FileSystem.getInfoAsync(uri);
    const filename = info.uri.split('/').pop();
    const mimeType = info.mimeType || 'image/jpeg';

    const formData = new FormData();
    formData.append('file', { uri, name: filename, type: mimeType });
    formData.append('caption', caption); // Utilisation de la légende entrée par l'utilisateur
    formData.append('user_id', 1); // Remplacez par l'ID utilisateur

    try {
      const response = await fetch('http://192.168.68.107/upload.php?action=uploadPost', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('Réponse du serveur:', responseText);
      let jsonResponse;

      try {
        jsonResponse = JSON.parse(responseText);
      } catch (error) {
        Alert.alert('Erreur', `Erreur lors du parsing JSON: ${error.message}. Réponse complète: ${responseText}`);
        return;
      }

      if (jsonResponse.message) {
        Alert.alert('Succès', jsonResponse.message);
      } else {
        Alert.alert('Erreur', jsonResponse.error);
      }
    } catch (error) {
      Alert.alert('Erreur', `Erreur lors du téléchargement de l'image: ${error.message}`);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Erreur', "Permission d'accès à la galerie refusée");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (result.canceled) {
      Alert.alert('Erreur', "Aucune image sélectionnée.");
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);
    console.log('Image URI:', uri);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder="Entrez votre légende"
        value={caption}
        onChangeText={setCaption}
        style={{ width: 200, borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Choisir une image" onPress={pickImage} />
      <Button title="Uploader l'image" onPress={() => uploadImage(imageUri)} />
    </View>
  );
};

export default App;
