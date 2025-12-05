import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  messagesCollection
} from '../firebase';
import { Icon } from '@rneui/themed';

type MessageType = {
  id: string;
  text: string;
  user: string;
  imageBase64?: string;
  createdAt: any;
};

export default function ChatScreen({ route }: any) {
  const { email } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const msgs = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageType[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      includeBase64: true,
    });

    if (result.assets && result.assets[0]) {
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !imageBase64) return;

    await addDoc(messagesCollection, {
      text: message,
      user: email,
      imageBase64: imageBase64 || null,
      createdAt: serverTimestamp(),
    });

    setMessage('');
    setImageBase64(null);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === email;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.user}</Text>
        )}

        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
          {item.imageBase64 && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}

          {item.text ? (
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}>
              {item.text}
            </Text>
          ) : null}

          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4fc3f7" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Room</Text>
        <Text style={styles.headerSubtitle}>Logged in as: {email}</Text>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      {/* Image Preview */}
      {imageBase64 && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewCard}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageBase64(null)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          {/* Menggunakan emoji atau text sebagai fallback */}
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() && !imageBase64) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!message.trim() && !imageBase64}
          activeOpacity={0.8}
        >
          {/* Menggunakan emoji sebagai fallback */}
          <Text style={[
            styles.sendButtonText,
            (!message.trim() && !imageBase64) && styles.sendButtonTextDisabled,
          ]}>
            ➤
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4fc3f7',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    marginLeft: 8,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#4fc3f7',
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: '#e3f2fd',
  },
  otherMessageTime: {
    color: '#999',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  removeImageButton: {
    backgroundColor: '#ff6b6b',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#4fc3f7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4fc3f7',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  sendButtonTextDisabled: {
    color: '#aaa',
  },
});