import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useCart } from './context/CartContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';

const primaryColor = '#0f4359';
const secondaryColor = '#8d6e52';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScn'>;

const CartScreen = () => {
  const { cartItems, updateCartItem, removeFromCart, syncCart, clearCart } = useCart();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    syncCart();
  }, []);

  // Xóa sản phẩm khi kéo sang trái
  const handleDelete = (id, selectedSize) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeFromCart(id, selectedSize) },
    ]);
  };

  // Hiện thông báo khi số lượng giảm về 0
  const handleDecreaseQuantity = (id, selectedSize, currentQuantity) => {
    if (currentQuantity <= 1) {
      Alert.alert('Xác nhận', 'Số lượng sản phẩm là 0. Bạn có muốn xóa sản phẩm này?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => removeFromCart(id, selectedSize),
        },
      ]);
    } else {
      updateCartItem(id, selectedSize, currentQuantity - 1);
    }
  };

  // Xóa tất cả sản phẩm
  const handleClearCart = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa tất cả', style: 'destructive', onPress: () => clearCart() },
    ]);
  };
  
  const handlePressCart = (item: any) => {
    if (item.type === 'drink') {
      if (item.productDetails) {
        navigation.navigate('CoffeeDetail', { product: item.productDetails });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin chi tiết sản phẩm Drink.');
      }
    } else if (item.type === 'bean') {
      if (item.productDetails) {
        navigation.navigate('Bean', { product: item.productDetails });
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin chi tiết sản phẩm Bean.');
      }
    } else {
      Alert.alert('Lỗi', 'Không thể điều hướng đến chi tiết sản phẩm.');
    }
  };

  const handleSizeChange = (id: string, currentSize: string, newSize: string) => {
    const item = cartItems.find((item) => item.id === id && item.selectedSize === currentSize);
    if (item) {
      let updatedPrice = item.price; // Giá mặc định
  
      // 🛠️ Xác định giá mới dựa trên loại sản phẩm và size
      if (item.type === 'drink') {
        switch (newSize) {
          case 'S':
            updatedPrice = item.prices?.['price_s'] || item.price;
            break;
          case 'M':
            updatedPrice = item.prices?.['price_m'] || item.price;
            break;
          case 'L':
            updatedPrice = item.prices?.['price_l'] || item.price;
            break;
          default:
            Alert.alert('Lỗi', `Kích thước "${newSize}" không hợp lệ cho sản phẩm "${item.name}".`);
        }
      } else if (item.type === 'bean') {
        switch (newSize) {
          case '250mg':
            updatedPrice = item.prices?.['price_250mg'] || item.price;
            break;
          case '500mg':
            updatedPrice = item.prices?.['price_500mg'] || item.price;
            break;
          case '1000mg':
            updatedPrice = item.prices?.['price_1000mg'] || item.price;
            break;
          default:
            Alert.alert('Lỗi', `Kích thước "${newSize}" không hợp lệ cho sản phẩm "${item.name}".`);
        }
      }
  
      // 🛠️ Cập nhật kích thước và giá mới vào CartContext
      updateCartItem(id, currentSize, undefined, newSize);
    }
  };

  const handleQuantityChange = (id: string, selectedSize: string, change: number) => {
    const item = cartItems.find((item) => item.id === id && item.selectedSize === selectedSize);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateCartItem(id, selectedSize, newQuantity);
      } else {
        removeFromCart(id, selectedSize);
      }
    }
  };

  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  const handlePay = () => {
    navigation.navigate('Payment', { 
      totalPrice: parseFloat(totalPrice), 
      cartItems: cartItems 
    });
  };

  const renderCartItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handlePressCart(item)}>
        <View style={styles.cartItem}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Kích thước sản phẩm */}
            <View style={styles.sizeContainer}>
              {item.type === 'bean'
                ? ['250mg', '500mg', '1000mg'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      size === item.selectedSize && styles.selectedSizeButton,
                    ]}
                    onPress={() => handleSizeChange(item.id, item.selectedSize, size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        size === item.selectedSize && styles.selectedSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))
                : ['S', 'M', 'L'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      size === item.selectedSize && styles.selectedSizeButton,
                    ]}
                    onPress={() => handleSizeChange(item.id, item.selectedSize, size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        size === item.selectedSize && styles.selectedSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Giá và số lượng */}
            <View style={styles.priceQuantityContainer}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecreaseQuantity(item.id, item.selectedSize, item.quantity)}
                >
                  <Icon name="minus" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, item.selectedSize, 1)}
                >
                  <Icon name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const renderHiddenItem = (data) => (
    <View style={styles.hiddenRow}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(data.item.id, data.item.selectedSize)}
      >
        <Text style={styles.deleteText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
      </View>

      <SwipeListView
        data={cartItems}
        keyExtractor={(item) => `${item.id}-${item.selectedSize}`}
        renderItem={renderCartItem} // Gọi hàm tách biệt
        renderHiddenItem={renderHiddenItem} // Nếu cần chức năng vuốt để xóa
        rightOpenValue={-75} // Vuốt sang trái để hiển thị nút xóa
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is currently empty.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.totalPrice}>Total Price: ${totalPrice}</Text>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 20 },
  header: { marginTop: 40, marginBottom: 15 },
  title: { color: primaryColor, fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  cartItem: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 10, marginBottom: 16 },
  image: { width: '30%', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  infoContainer: { flex: 1, marginLeft: 16 },
  productName: { color: primaryColor, fontSize: 16, fontWeight: 'bold' },
  description: { color: primaryColor, fontSize: 12, marginVertical: 4 },
  sizeContainer: { flexDirection: 'row', marginVertical: 8 },
  sizeButton: { backgroundColor: primaryColor, borderRadius: 4, padding: 6, marginRight: 8 },
  selectedSizeButton: { backgroundColor: secondaryColor },
  sizeText: { color: '#fff', fontSize: 12 },
  selectedSizeText: { fontWeight: 'bold' },
  priceQuantityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  price: { color: primaryColor, fontSize: 16, fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: primaryColor, borderRadius: 4 },
  quantityButton: { padding: 6 },
  quantityText: { color: 'white', fontSize: 14, marginHorizontal: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingVertical: 16,
    marginBottom: 100,
  },
  totalPrice: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: secondaryColor,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
  hiddenRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    marginBottom: 10,
    borderRadius: 5,
    height: '85%',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CartScreen;
