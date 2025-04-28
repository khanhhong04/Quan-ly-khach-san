import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

// Định nghĩa kiểu cho tin nhắn
interface Message {
    text: string;
    sender: 'user' | 'bot'; // sender chỉ có thể là 'user' hoặc 'bot'
}

const Chatbot = () => {
    // Khai báo state với kiểu Message[]
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>('');

    const sendMessage = async () => {
        if (!inputText) return;

        // Thêm tin nhắn của người dùng
        setMessages([...messages, { text: inputText, sender: 'user' }]);

        try {
            // Gọi API Dialogflow với Project ID của bạn
            const response = await axios.post(
                `https://dialogflow.googleapis.com/v2/projects/hotel-dxlo/agent/sessions/user123-session:detectIntent`,
                {
                    queryInput: {
                        text: {
                            text: inputText,
                            languageCode: 'vi',
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Thay YOUR_ACCESS_TOKEN bằng token thực tế
                    },
                }
            );

            const botResponse = response.data.queryResult.fulfillmentText;
            setMessages([...messages, { text: inputText, sender: 'user' }, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Error calling Dialogflow:', error);
            setMessages([...messages, { text: inputText, sender: 'user' }, { text: 'Có lỗi xảy ra, vui lòng thử lại.', sender: 'bot' }]);
        }

        setInputText('');
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }: { item: Message }) => (
                    <View style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
                        <Text style={styles.messageText}>
                            {item.sender === 'user' ? 'Bạn: ' : 'Bot: '}{item.text}
                        </Text>
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                style={styles.messageList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Nhập tin nhắn..."
                    style={styles.input}
                />
                <Button title="Gửi" onPress={sendMessage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    messageList: {
        flex: 1,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        maxWidth: '70%',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E5EA',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        maxWidth: '70%',
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        padding: 10,
        marginRight: 10,
    },
});

export default Chatbot;