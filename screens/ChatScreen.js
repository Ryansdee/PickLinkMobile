import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import Feather from 'react-native-vector-icons/Feather';  
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ route }) => {
  const { recipientEmail, recipientUsername } = route.params; // Récupération des paramètres
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usernameId, setUsernameId] = useState(null); // ID de l'utilisateur connecté
  const [recipientId, setRecipientId] = useState(null); // ID du destinataire

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          // Récupérer l'ID de l'utilisateur connecté
          const userResponse = await fetch(`http://www.picklink.be/api.php?action=getUser&username=${storedUsername}`);
          const userData = await userResponse.json();
          if (userData && userData.user) {
            setUsernameId(userData.user.id);
          }
        }

        // Récupérer l'ID du destinataire basé sur l'email
        const recipientResponse = await fetch(`http://www.picklink.be/api.php?action=getUserByEmail&email=${recipientEmail}`);
        const recipientData = await recipientResponse.json();
        if (recipientData && recipientData.user) {
          setRecipientId(recipientData.user.id);
        }

        // Récupérer les messages
        const response = await fetch(`http://www.picklink.be/api.php?action=getMessages&username=${usernameId}&recipient=${recipientId}`);
        const data = await response.json();
        if (data && data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchUserData();
  }, [recipientEmail, recipientId]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const newMessageData = {
        senderId: usernameId,
        recipientId: recipientId,
        messageText: newMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, newMessageData]);
      setNewMessage('');

      try {
        const response = await fetch(`http://192.168.68.107/api.php?action=sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessageData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        if (result.success) {
          console.log('Message envoyé');
        } else {
          console.error('Erreur lors de l\'envoi du message', result);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message', error);
      }
    }
  };

  return (
    <View style={{ flex: 1, marginBottom: 25, backgroundColor: 'black' }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text style={{ color: 'white' }}>{item.message_text}</Text>
            <Text style={{ color: 'gray' }}>{item.timestamp}</Text>
          </View>
        )}
        keyExtractor={(item) => item.timestamp + Math.random().toString(36).substring(7)}  
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre message..."
          onChangeText={setNewMessage}
          value={newMessage}
          placeholderTextColor="gray"
        />
        <TouchableOpacity onPress={sendMessage}>
          <Feather name="send" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginRight: 10,
  },
});

export default ChatScreen;
