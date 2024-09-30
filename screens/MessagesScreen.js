import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Image } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo } from 'react-native-vector-icons';

const defaultProfileImage = 'https://oodp.ca/media/tutor-8.jpg';

// Affiche chaque discussion comme une carte
const DiscussionCard = ({ senderUsername, lastMessage, onPress }) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image
        source={{ uri: defaultProfileImage }}  // Vous pouvez remplacer cette URL par l'image du profil de l'utilisateur si disponible
        style={styles.profileImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.senderName}>{senderUsername || 'Utilisateur inconnu'}</Text>
        <Text style={styles.cardText}>{lastMessage || 'Aucun message'}</Text>
      </View>
      <Entypo name="chevron-right" size={24} color="#000" />
    </TouchableOpacity>
  );
};

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        if (storedEmail) {
          setEmail(storedEmail);  // Stocker l'email de l'utilisateur connecté
          // Appel API pour récupérer les conversations
          const response = await fetch(`http://127.0.0.1/api.php?action=getConversations&email=${storedEmail}`);
          const data = await response.json();
          if (data && data.conversations) {
            setConversations(data.conversations); // Les conversations récupérées
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchUserData();
  }, []);

  const openConversation = (recipientEmail, recipientUsername) => {
    navigation.navigate('ChatScreen', { recipientEmail, recipientUsername });
  };

  const renderItem = ({ item }) => (
    <DiscussionCard
      senderUsername={item.recipientUsername} // Le nom d'utilisateur de la personne avec qui la discussion est
      lastMessage={item.lastMessage} // Dernier message affiché dans la carte
      onPress={() => openConversation(item.recipientEmail, item.recipientUsername)}  // Ouvrir la discussion
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1E201E' }}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.recipientEmail}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={<Text style={styles.noConversationsText}>Aucune conversation trouvée.</Text>} // Message si aucune conversation
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#000a14',
    borderRadius: 10,
    shadowColor: '#1E201E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  senderName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardText: {
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noConversationsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});

export default MessagesScreen;
