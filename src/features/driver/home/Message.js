import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const MessageScreen = () => {
  // Complete list of 10 conversations
  const conversations = [
    {
      id: '1',
      user: 'Customer Support',
      lastMessage: 'Your issue has been resolved',
      time: '10:30 AM',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: '2',
      user: 'Rider: Rajesh K.',
      lastMessage: 'I have arrived at pickup location',
      time: 'Yesterday',
      unread: true,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: '3',
      user: 'Rider: Priya M.',
      lastMessage: 'Please come to gate number 3',
      time: 'Yesterday',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
    },
    {
      id: '4',
      user: 'Rider: Amit S.',
      lastMessage: 'Please confirm your location',
      time: '2 days ago',
      unread: true,
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    {
      id: '5',
      user: 'Rider: Neha P.',
      lastMessage: 'Your ride is on the way',
      time: '3 days ago',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      id: '6',
      user: 'Customer Care',
      lastMessage: 'Your feedback is important to us',
      time: '1 week ago',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
      id: '7',
      user: 'Rider: Sanjay M.',
      lastMessage: 'I will be there in 5 mins',
      time: '1 week ago',
      unread: true,
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: '8',
      user: 'Rider: Anjali K.',
      lastMessage: 'Please wear a mask',
      time: '2 weeks ago',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      id: '9',
      user: 'Payment Support',
      lastMessage: 'Your refund has been processed',
      time: '2 weeks ago',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/men/60.jpg'
    },
    {
      id: '10',
      user: 'Rider: Vikram J.',
      lastMessage: 'Thanks for riding with us!',
      time: '3 weeks ago',
      unread: false,
      avatar: 'https://randomuser.me/api/portraits/men/38.jpg'
    }
  ];

  const [activeConversation, setActiveConversation] = useState(null);
  const [messageText, setMessageText] = useState('');

  // Sample messages for each conversation
  const messages = {
    '1': [
      { id: '1', text: 'Hello, how can I help you?', time: '10:20 AM', sent: false },
      { id: '2', text: 'I have an issue with my payment', time: '10:22 AM', sent: true },
      { id: '3', text: 'Your issue has been resolved', time: '10:30 AM', sent: false },
    ],
    '2': [
      { id: '1', text: 'I have arrived at pickup location', time: '9:45 AM', sent: false },
      { id: '2', text: 'Coming in 2 minutes', time: '9:46 AM', sent: true },
    ],
    '3': [
      { id: '1', text: 'Please come to gate number 3', time: '11:30 AM', sent: false },
      { id: '2', text: 'On my way', time: '11:31 AM', sent: true },
    ],
    '4': [
      { id: '1', text: 'Please confirm your location', time: '2:15 PM', sent: false },
    ],
    '5': [
      { id: '1', text: 'Your ride is on the way', time: '4:45 PM', sent: false },
    ],
    '6': [
      { id: '1', text: 'Your feedback is important to us', time: '10:00 AM', sent: false },
    ],
    '7': [
      { id: '1', text: 'I will be there in 5 mins', time: '7:30 PM', sent: false },
    ],
    '8': [
      { id: '1', text: 'Please wear a mask', time: '12:15 PM', sent: false },
    ],
    '9': [
      { id: '1', text: 'Your refund has been processed', time: '3:20 PM', sent: false },
    ],
    '10': [
      { id: '1', text: 'Thanks for riding with us!', time: '6:45 PM', sent: false },
    ]
  };

  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    console.log('Message sent:', messageText);
    setMessageText('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!activeConversation ? (
        <View className="flex-1">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-black text-xl font-bold text-center">Messages</Text>
          </View>

          <ScrollView className="flex-1">
            {conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                className="mx-2 mb-3 rounded-xl overflow-hidden"
                onPress={() => setActiveConversation(conversation.id)}
              >
                <LinearGradient
                  colors={['#4F46E5', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center p-4"
                >
                  <Image
                    source={{ uri: conversation.avatar }}
                    className="w-12 h-12 rounded-full border-2 border-green-500 mr-4"
                  />
                  <View className="flex-1">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-white font-bold">{conversation.user}</Text>
                      <Text className="text-gray-200 text-xs">{conversation.time}</Text>
                    </View>
                    <Text
                      className={`text-gray-100 text-sm ${conversation.unread ? 'font-bold text-white' : ''}`}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                  </View>
                  {conversation.unread && (
                    <View className="w-3 h-3 bg-green-500 rounded-full ml-2" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View className="flex-1 bg-white">
          {/* Chat Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
            <TouchableOpacity onPress={() => setActiveConversation(null)}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Image
              source={{ uri: conversations.find(c => c.id === activeConversation).avatar }}
              className="w-10 h-10 rounded-full border-2 border-green-500 mx-4"
            />
            <Text className="text-black text-lg font-bold">
              {conversations.find(c => c.id === activeConversation).user}
            </Text>
          </View>

          {/* Messages */}
          <ScrollView className="flex-1 px-4 py-2 bg-white">
            {messages[activeConversation]?.map((message) => (
              <View
                key={message.id}
                className={`max-w-[80%] px-4 py-3 rounded-xl mb-2 ${
                  message.sent ? 'bg-green-500 self-end' : 'bg-black self-start'
                }`}
              >
                <Text className="text-white text-base">{message.text}</Text>
                <Text className="text-gray-300 text-xs text-right mt-1">{message.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input */}
          <View className="flex-row items-center px-3 py-2 border-t border-gray-200 bg-white">
            <TextInput
              className="flex-1 bg-gray-100 text-black rounded-full px-4 py-3 mr-2"
              placeholder="Type a message"
              placeholderTextColor="#777"
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity onPress={handleSendMessage} className="p-2">
              <MaterialIcons
                name={messageText ? 'send' : 'mic'}
                size={24}
                color="#4CAF50"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MessageScreen;