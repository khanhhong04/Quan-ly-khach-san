import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Sử dụng icon từ thư viện expo (cần cài đặt)

interface Room {
  id: string;
  roomNumber: string;
  status: string;
  type: string;
  price: string;
}

const roomsData: Room[] = [
  { id: '1', roomNumber: '101', status: 'Available', type: 'Single', price: '$50/night' },
  { id: '2', roomNumber: '102', status: 'Booked', type: 'Double', price: '$80/night' },
  { id: '3', roomNumber: '103', status: 'Available', type: 'Suite', price: '$120/night' },
  { id: '4', roomNumber: '104', status: 'Booked', type: 'Single', price: '$50/night' },
];

const HomeScreen = () => {
  const renderRoomItem = ({ item }: { item: Room }) => (
    <View style={[styles.roomCard, { backgroundColor: item.status === 'Available' ? '#E6F4EA' : '#FEE2E2' }]}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
        <Text style={styles.roomType}>{item.type}</Text>
        <Text style={styles.roomPrice}>{item.price}</Text>
      </View>
      <View style={styles.roomStatus}>
        <Text style={[styles.statusText, { color: item.status === 'Available' ? '#34C759' : '#FF3B30' }]}>
          {item.status}
        </Text>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' }}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hotel Management</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>Total Rooms</Text>
            <Text style={styles.summaryValue}>20</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>Available</Text>
            <Text style={styles.summaryValue}>12</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>Booked</Text>
            <Text style={styles.summaryValue}>8</Text>
          </View>
        </View>

        <FlatList
          data={roomsData}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id}
          style={styles.roomList}
        />

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={30} color="#fff" />
          <Text style={styles.addButtonText}>Add New Room</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    elevation: 5,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  roomList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 3,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roomType: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  roomPrice: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  roomStatus: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: '#6200EA',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6200EA',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;
