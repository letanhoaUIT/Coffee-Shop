import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from './context/CartContext'; // Import CartContext
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const primaryColor = '#0f4359'; // Màu chủ xanh dương
const secondaryColor = '#8d6e52'; // Màu phụ đất


interface PaymentMethod {
  method_name: string;
  description?: string;
}

const PaymentScreen = ({ navigation }) => {
  const { cartItems, syncCart } = useCart(); // Lấy giỏ hàng từ CartContext
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState(''); // Địa chỉ nhận hàng
  const [recipient, setRecipient] = useState(''); // Người nhận hàng
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to view your address.');
        return;
      }

      const response = await api.get('/auth/user/address', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedAddress = response.data.address;
      setAddress(fetchedAddress || ''); // Nếu không có địa chỉ trả về, đặt thành rỗng
    } catch (error) {
      console.error('Error fetching address:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load address.');
      setAddress(''); // Đảm bảo address luôn có giá trị để tránh lỗi
    }
  };

  useEffect(() => {
    fetchAddress(); // Gọi hàm để lấy địa chỉ khi màn hình được tải
  }, []);


  // Tính tổng giá giỏ hàng

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);


  const updateAddress = async (newAddress) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please log in to update your address.');
        return;
      }

      const response = await api.put(
        '/auth/user/address',
        { address: newAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddress(response.data.address); // Cập nhật địa chỉ mới
    } catch (error) {
      console.error('Error updating address:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update address.');
    }
  };

  // Fetch danh sách phương thức thanh toán
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'Please log in to view payment methods.');
          return;
        }

        const response = await api.get('/orders/payment-methods', {
          headers: { Authorization: `Bearer ${token}` }, // Đảm bảo token hợp lệ
        });

        setPaymentMethods(response.data);
        setSelectedMethod(response.data[0]?.method_name || '');
      } catch (error: any) {
        console.error('Error fetching payment methods:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'Failed to load payment methods.');
      }
    };

    fetchPaymentMethods();
  }, []);

  const { clearCart } = useCart();
  // Xử lý thanh toán
  const handlePayment = async () => {
    if (!address) {
      Alert.alert('Lỗi', 'Bạn cần nhập địa chỉ nhận hàng trước khi thanh toán.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token gửi lên backend:', token); // Log token
      if (!token) {
        Alert.alert('Error', 'Please log in to complete payment.');
        return;
      }

      const response = await api.post(
        '/orders/create',
        {
          payment_method_name: selectedMethod,
          total_amount: totalPrice,
          items: cartItems.map((item) => ({
            product_type: 'drink',
            product_id: item.id,
            size: item.selectedSize,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Gửi token
        }
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Payment successful!');
        clearCart();
        navigation.navigate('OrderHistory');
      }
    } catch (error) {
      console.error('Error during payment:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  // Hàm lấy địa chỉ từ định vị
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Không có quyền truy cập vị trí!');
        setIsLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = location.coords;

      // Dùng reverse geocoding để chuyển tọa độ thành địa chỉ
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        let { name, district, city, country } = reverseGeocode[0];
        let fullAddress = `${name}, ${district}, ${city}, ${country}`;
        setAddress(fullAddress); // Lưu địa chỉ vào state

        // Gọi API để cập nhật địa chỉ ngay lập tức
        await updateAddress(fullAddress);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        Alert.alert('Lỗi', 'Không thể lấy được địa chỉ từ tọa độ!');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Xảy ra lỗi khi lấy vị trí!');
      console.error(error);
    } finally {
      setIsLoadingLocation(false);
      setShowAddressModal(false); // Đóng modal
    }
  };


  const handleSelectLocation = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      // Sử dụng reverse geocoding để lấy địa chỉ từ tọa độ người dùng chọn
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseGeocode.length > 0) {
        const { street, city, region, country } = reverseGeocode[0];
        const selectedAddress = `${street}, ${city}, ${region}, ${country}`;

        setAddress(selectedAddress); // Lưu địa chỉ vào state
        setSelectedLocation({ latitude, longitude });

        // Gọi API để cập nhật địa chỉ ngay lập tức
        await updateAddress(selectedAddress);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        Alert.alert('Lỗi', 'Không thể lấy địa chỉ từ vị trí đã chọn.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Xảy ra lỗi khi lấy địa chỉ từ bản đồ.');
      console.error(error);
    }
  };




  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#0f4359" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>

      {/* Giao nhận hàng */}
      {/* Delivery Info */}
      <View style={styles.deliveryInfo}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Giao hàng</Text>
          <TouchableOpacity onPress={() => setShowAddressModal(true)}>
            <Text style={styles.changeButton}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.address, !address && { color: 'red' }]}>
          {address || 'Vui lòng nhập địa chỉ nhận hàng'}
        </Text>
        {/* updateAddress(address); */}
        <TextInput
          style={styles.instructionsInput}
          placeholder="Thêm hướng dẫn giao hàng"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Danh sách phương thức thanh toán */}
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.method_name}
          style={[styles.paymentMethod, selectedMethod === method.method_name && styles.selectedPaymentMethod]}
          onPress={() => setSelectedMethod(method.method_name)}
        >
          <Icon name="credit-card" size={24} color="#fff" />
          <Text style={styles.paymentMethodText}>{method.method_name}</Text>
        </TouchableOpacity>
      ))}

      {/* Modal thay đổi địa chỉ */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddressModal(false);
          if (address) {
            updateAddress(address); // Gọi API nếu địa chỉ đã được cập nhật
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowAddressModal(false);
                if (address) {
                  updateAddress(address); // Gọi API nếu địa chỉ đã được cập nhật
                }
              }}>
                <Icon name="arrow-left" size={24} color="#0f4359" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nhập địa chỉ</Text>
            </View>

            {/* Lựa chọn địa chỉ */}
            <TouchableOpacity style={styles.optionButton} onPress={handleGetLocation}>
              <Icon name="map-marker" size={20} color="#555" />
              <Text style={styles.optionText}>
                {isLoadingLocation ? 'Đang lấy địa chỉ...' : 'Địa chỉ của bạn'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => setShowAddressModal(false)}>
              <Icon name="map" size={20} color="#555" />
              <Text style={styles.optionText}>Chọn trên bản đồ</Text>
            </TouchableOpacity>

            {/* Bản đồ */}
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedLocation ? selectedLocation.latitude : 21.0285,
                longitude: selectedLocation ? selectedLocation.longitude : 105.8542,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onPress={handleSelectLocation}
            >
              {selectedLocation && (
                <Marker coordinate={selectedLocation} />
              )}
            </MapView>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.price}>Total Price: ${totalPrice.toFixed(2)}</Text>
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>Pay with {selectedMethod}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40 },
  backButton: { marginRight: 20 },
  title: { color: primaryColor, fontSize: 28, fontWeight: 'bold' },
  paymentMethod: {
    flexDirection: 'row', backgroundColor: 'white', padding: 20, marginVertical: 10, borderRadius: 5, borderWidth: 1.2,
    borderColor: primaryColor,
  },
  selectedPaymentMethod: { backgroundColor: '#a76400' },
  paymentMethodText: { color: primaryColor, fontSize: 18, marginLeft: 10, fontWeight: '500' },
  footer: { marginTop: 20 },
  price: { fontWeight: 'bold', color: primaryColor, fontSize: 18, marginBottom: 10 },
  payButton: { backgroundColor: '#a76400', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  //address style
  deliveryInfo: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
  },
  changeButton: {
    fontSize: 14,
    color: secondaryColor,
  },
  address: {
    fontSize: 14,
    marginTop: 5,
    color: '#333',
  },
  recipient: {
    fontSize: 14,
    marginTop: 2,
    color: '#555',
  },
  instructionsInput: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 14,
  },
  //modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f4359', marginLeft: 10 },
  searchInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  optionText: { marginLeft: 10, fontSize: 14, color: '#555' },

  map: {
    width: '100%',
    height: 400,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default PaymentScreen;
