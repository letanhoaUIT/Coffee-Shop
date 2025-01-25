import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../api/axiosConfig';

const primaryColor = '#0f4359'; // Màu chủ xanh dương

interface CoffeeProduct {
  id: string; // Sử dụng string vì ID trong API có thể là string (ObjectId)
  name: string;
  description: string;
  price_250mg: number; // Cập nhật lại theo giá trị từ API
  image_url: string; // Cập nhật lại theo đúng tên trường trong API
}

const CoffeeBeansList = ({ onPressProduct }: { onPressProduct: (item: CoffeeProduct) => void }) => {
  const [coffeeBeans, setCoffeeBeans] = useState<CoffeeProduct[]>([]); // Lưu trữ dữ liệu từ API

  useEffect(() => {
    const fetchCoffeeBeans = async () => {
      try {
        const response = await api.get('coffeeBeans'); // Địa chỉ API của bạn
        setCoffeeBeans(response.data); // Lưu trữ dữ liệu vào state
      } catch (error) {
        console.error('Error fetching coffee beans:', error);
      }
    };

    fetchCoffeeBeans();
  }, []);

  return (
    <View>
      <Text style={styles.sectionTitle}>COFFEE BEANS</Text>
      <FlatList
        horizontal
        data={coffeeBeans} // Sử dụng trực tiếp dữ liệu từ API
        keyExtractor={item => item.id ? item.id.toString() : item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onPressProduct(item)}>
            <View style={styles.card}>
              <Image source={{ uri: item.image_url }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription}>{item.description}</Text>
                <Text style={styles.productPrice}>${item.price_250mg}</Text> {/* Sử dụng price_250mg từ API */}
              </View>
              <TouchableOpacity style={styles.addButton} onPress={() => onPressProduct(item)}>
                <Icon name="plus" size={12} color="#0f4359" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    width: 175,
    height: 260,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '65%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
  },
  productDescription: {
    fontSize: 12,
    color: primaryColor,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: primaryColor,
  },
  addButton: {
    position: 'absolute',
    right: 8,
    bottom: 15,
    backgroundColor: 'white',
    borderRadius: 180,
    padding: 6,
    borderWidth: 1, // Độ dày của viền
    borderColor: primaryColor,
  },
});

export default CoffeeBeansList;
