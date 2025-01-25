import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosConfig';

const backgroundColor = 'white';
const primaryColor = '#0f4359';
const secondaryColor = '#8d6e52';

interface OrderItem {
  _id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  total_amount: number;
  payment_method: string;
  items: OrderItem[];
}

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Fetch Order History
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'Please log in to view order history.');
          return;
        }
        const response = await api.get('/orders/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error('Error fetching order history:', error.message);
        Alert.alert('Error', 'Failed to fetch order history.');
      }
    };
    fetchOrders();
  }, []);

  // Sort Orders
  const sortOrders = (sortType: string) => {
    let sortedOrders = [...orders];
    if (sortType === 'lowToHigh') {
      sortedOrders.sort((a, b) => a.total_amount - b.total_amount);
    } else if (sortType === 'highToLow') {
      sortedOrders.sort((a, b) => b.total_amount - a.total_amount);
    }
    setFilteredOrders(sortedOrders);
    setSelectedSort(sortType);
    setActiveFilter(sortType);
    setModalVisible(false);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderDate}>Order Date: {new Date(item.createdAt).toDateString()}</Text>
      <Text style={styles.totalAmount}>Total Amount: ${item.total_amount.toFixed(2)}</Text>
      <Text style={styles.paymentMethod}>Payment: {item.payment_method}</Text>

      {item.items.map((orderItem) => (
        <View key={orderItem._id} style={styles.orderItem}>
          <Text style={styles.productName}>{orderItem.name}</Text>
          <View style={styles.sizeRow}>
            <Text style={styles.sizeText}>Size: {orderItem.size}</Text>
            <Text style={styles.priceText}>${orderItem.price.toFixed(2)} x {orderItem.quantity}</Text>
            <Text style={styles.totalPriceText}>${(orderItem.price * orderItem.quantity).toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.textFilter}>
            Lọc <Icon name="filter" size={25} color={primaryColor} />
          </Text>
        </TouchableOpacity>
      </View>

      {/* No Orders Message */}
      {filteredOrders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          <Image source={require('../assets/no-order-history.png')} style={styles.noOrdersImage} />
          <Text style={styles.noOrdersText}>You have no orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
        />
      )}

      {/* Filter Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Orders</Text>
            <TouchableOpacity
              style={[styles.filterOption, activeFilter === 'lowToHigh' && { backgroundColor: secondaryColor }]}
              onPress={() => sortOrders('lowToHigh')}
            >
              <Text style={[styles.filterText, activeFilter === 'lowToHigh' && { color: 'white' }]}>Price: Low to High</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, activeFilter === 'highToLow' && { backgroundColor: secondaryColor }]}
              onPress={() => sortOrders('highToLow')}
            >
              <Text style={[styles.filterText, activeFilter === 'highToLow' && { color: 'white' }]}>Price: High to Low</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    marginBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  title: {
    color: primaryColor,
    fontSize: 28,
    fontWeight: 'bold',
  },
  textFilter: { color: primaryColor, fontSize: 18, fontWeight: 'bold', },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 10,
    padding: 16,
    borderWidth: 1,

  },
  orderDate: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#ff7f50',
    fontSize: 16,
    marginTop: 4,
  },
  orderItem: {
    marginVertical: 10,
  },
  productName: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  sizeText: {
    color: 'black',
  },
  priceText: {
    color: 'black',
  },
  totalPriceText: {
    color: 'black',
    fontWeight: 'bold',
  },
  // New styles for "No Orders" section
  noOrdersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 100,
  },
  noOrdersImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  noOrdersText: {
    fontSize: 18,
    color: primaryColor,
    textAlign: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay màu mờ
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,  // Bo tròn các góc modal
    width: '80%',  // Cân chỉnh chiều rộng modal
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 15,
  },
  filterInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: primaryColor,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  filterText: {
    fontSize: 16,
    color: primaryColor,
  },
});

export default OrderHistoryScreen;
