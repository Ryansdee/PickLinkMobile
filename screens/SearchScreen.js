import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Image } from 'react-native-elements';

const defaultProfileImage = 'https://oodp.ca/media/tutor-8.jpg'; // Une image par défaut pour les profils sans image

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState(''); // État pour la requête de recherche
  const [searchResults, setSearchResults] = useState([]); // État pour les résultats de la recherche

  // Fonction de recherche
  const handleSearch = async () => {
    if (searchQuery.trim() === '') return; // Vérifiez si la requête n'est pas vide

    try {
      const response = await fetch(`http://192.168.68.107/api.php?action=searchUser&query=${encodeURIComponent(searchQuery)}`);
      // Vérifiez le statut de la réponse
      if (!response.ok) {
        const errorText = await response.text(); // Lire le texte brut
        throw new Error(`Error: ${response.status} - ${errorText}`); // Lancer une erreur avec le message d'erreur
      }
      const data = await response.json(); // Convertir en JSON

      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data); // Stocker les résultats de recherche
      } else {
        setSearchResults([]); // Si pas de résultats, vider les résultats
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Affichage de chaque résultat sous forme de carte
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('ChatScreen', { 
        recipientEmail: item.email, // Passez l'email de l'utilisateur
        recipientUsername: item.username // Passez le nom d'utilisateur
      })}
    >
      <Image
        source={{ uri: item.profileImage || defaultProfileImage }}
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un utilisateur..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch} // Rechercher lorsque l'utilisateur soumet la requête
      />
      <FlatList
        data={searchResults}
        renderItem={renderUser}
        keyExtractor={(item) => item.email}
        ListEmptyComponent={<Text style={styles.noResultsText}>Aucun résultat(s)</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
    backgroundColor: '#1E201E'
  },
  searchInput: {
    height: 50,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: 'white'
  },
  userCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    color: '#555',
    marginTop: 5,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
  },
});

export default SearchScreen;
