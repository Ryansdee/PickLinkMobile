import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, Animated, TouchableOpacity } from 'react-native';
import { Button, Image } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import Ionicons from 'react-native-vector-icons/Ionicons';

const defaultProfileImage = 'https://i.ibb.co/X76Y1Sd/banner.png';
const API_URL = 'http://192.168.68.107/api/getPosts.php'; // URL de l'API pour récupérer les posts
const LIKED_POSTS_URL = 'http://192.168.68.107/api/getLikedPosts.php'; // URL de l'API pour récupérer les posts aimés
const LIKE_URL = 'http://192.168.68.107/api/likePost.php'; // URL de l'API pour aimer un post
const UNLIKE_URL = 'http://192.168.68.107/api/unlikePost.php'; // URL de l'API pour ne plus aimer un post

export default function HomeScScreen({ navigation }) {
    const [profileImage, setProfileImage] = useState(defaultProfileImage);
    const [posts, setPosts] = useState([]); // État pour stocker les posts
    const [likedPosts, setLikedPosts] = useState(new Set()); // État pour suivre les posts aimés
    const [scaleAnim] = useState(new Animated.Value(1)); // Animation pour le bouton de like

    useEffect(() => {
        const loadProfileImage = async () => {
            try {
                const savedImage = await AsyncStorage.getItem('profileImage');
                if (savedImage) {
                    setProfileImage(savedImage);
                }
            } catch (error) {
                console.log('Erreur lors du chargement de l\'image de profil:', error);
            }
        };

        const loadPostsAndLikes = async () => {
            try {
                // Charger les posts
                const response = await fetch(API_URL);
                const data = await response.json();
                if (data && Array.isArray(data.posts)) {
                    const loadedPosts = data.posts.map(post => ({
                        post_id: post.post_id,
                        image: `http://192.168.68.107/uploads/${post.image}`,
                        caption: post.caption,
                        username: post.username,
                        likeCount: post.like_count, 
                    }));
    
                    // Vérifier si les posts ont changé avant de mettre à jour l'état
                    if (JSON.stringify(loadedPosts) !== JSON.stringify(posts)) {
                        setPosts(loadedPosts);
                    }
    
                    // Charger les posts aimés après le chargement des posts
                    await fetchLikedPosts();
                } else {
                    console.log('Aucun post trouvé ou structure de données incorrecte');
                }
            } catch (error) {
                console.log('Erreur lors du chargement des posts ou des posts aimés:', error);
                Alert.alert('Erreur', 'Erreur lors du chargement des posts ou des likes.');
            }
        };
    
        // Charger l'image de profil une fois au montage du composant
        loadProfileImage();
    
        // Charger les posts et vérifier les mises à jour toutes les secondes
        const interval = setInterval(() => {
            loadPostsAndLikes();
        }, 1000); // 1 seconde
    
        // Nettoyer l'intervalle à la destruction du composant
        return () => clearInterval(interval);
    }, [posts]);

    const fetchLikedPosts = async () => {
        try {
            const response = await fetch(LIKED_POSTS_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important pour l'authentification basée sur les cookies
            });
            const data = await response.json();
            console.log('Réponse des posts aimés:', data); // Journaliser la réponse

            // Vérifier s'il y a une erreur dans la réponse
            if (data.error) {
                Alert.alert('Erreur', 'Vous devez vous connecter pour accéder à cette fonction.'); // Alerte si non connecté
                return;
            }

            if (data && Array.isArray(data.likedPosts)) {
                const likedPostSet = new Set(data.likedPosts.map(post => post.post_id));
                setLikedPosts(likedPostSet); // Mettre à jour les posts aimés
            } else {
                console.log('Aucun post aimé trouvé ou structure de données incorrecte');
            }
        } catch (error) {
            console.log('Erreur lors de la récupération des posts aimés:', error);
        }
    };

    const formatLikeCount = (count) => {
        return count === 1 ? `${count} Like` : `${count} Likes`;
    };

    const handleLikePost = async (postId) => {
        console.log("ID du post à aimer/ne plus aimer:", postId);
        
        if (likedPosts.has(postId)) {
            await unlikePost(postId);
        } else {
            await likePost(postId);
        }
    };

    const likePost = async (postId) => {
        console.log("Aimer le post ID:", postId);
        try {
            const response = await fetch(LIKE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include', 
                body: JSON.stringify({ post_id: postId }),
            });
            const result = await response.json();
            if (result.success) {
                setPosts(posts.map(post => 
                    post.post_id === postId ? { ...post, likeCount: post.likeCount + 1 } : post
                ));
                setLikedPosts(new Set(likedPosts).add(postId)); // Ajouter le post à l'ensemble des aimés
                triggerAnimation();
            } else {
                Alert.alert('Erreur', result.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.log('Erreur lors de l\'aimement du post:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'aimement du post.');
        }
    };

    const unlikePost = async (postId) => {
        console.log("Ne plus aimer le post ID:", postId);
        try {
            const response = await fetch(UNLIKE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ post_id: postId }),
            });
            const result = await response.json();
            if (result.success) {
                setPosts(posts.map(post => 
                    post.post_id === postId ? { ...post, likeCount: post.likeCount - 1 } : post
                ));
                likedPosts.delete(postId); // Supprimer le post de l'ensemble des aimés
                setLikedPosts(new Set(likedPosts)); // Mettre à jour l'état
            } else {
                Alert.alert('Erreur', result.error || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.log('Erreur lors du ne plus aimer du post:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors du ne plus aimer du post.');
        }
    };

    const triggerAnimation = () => {
        scaleAnim.setValue(1.5);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    let [fontsLoaded] = useFonts({
        Pacifico_400Regular,
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                    onError={() => {
                        console.log('Erreur de chargement de l\'image, utilisation de l\'image par défaut');
                        setProfileImage(defaultProfileImage);
                    }}
                    PlaceholderContent={<Text>Chargement...</Text>}
                />
                <Button 
                    icon={<Ionicons name="chatbox-ellipses-sharp" size={25} color="#4cb5cf" />} 
                    onPress={() => navigation.navigate('Messages')} 
                    buttonStyle={styles.buttonStyle}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {posts.length === 0 ? (
                    <Text style={{ color: '#fff' }}>Aucun post à afficher</Text>
                ) : (
                    posts.map((post) => (
                        <View key={post.post_id} style={styles.postContainer}>
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: post.image }}
                                    style={styles.postImage}
                                    onError={() => console.log('Erreur de chargement de l\'image du post')}
                                    PlaceholderContent={<Text>Chargement...</Text>}
                                />
                            </View>
                            <Text style={styles.usernameText}>{post.username}</Text>
                            <Text style={styles.texta}>-</Text>
                            <Text style={styles.captionText}>{post.caption}</Text>
                            <View style={styles.likeContainer}>
                                <TouchableOpacity onPress={() => handleLikePost(post.post_id)}>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <Ionicons 
                                            name="heart" 
                                            size={25} 
                                            color={likedPosts.has(post.post_id) ? "red" : "#fff"} 
                                            style={styles.likeIcon} 
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                                <Text style={styles.likeCountText}>{formatLikeCount(post.likeCount)}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        marginTop: 30,
    },
    profileImage: {
        width: 150,
        height: 35,
    },
    buttonStyle: {
        backgroundColor: 'transparent',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    postContainer: {
        marginBottom: 20,
        width: '92%',
        marginLeft: '5%',
        backgroundColor: '#1c1c1c',
        padding: 10,
        borderRadius: 10,
    },
    imageContainer: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    postImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginLeft: 75
    },
    usernameText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 1,
    },
    texta: {
        color: '#fff',
    },
    captionText: {
        color: '#fff',
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    likeIcon: {
        marginRight: 5,
    },
    likeCountText: {
        color: '#fff',
    },
});
