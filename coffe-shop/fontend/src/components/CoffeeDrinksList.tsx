// CoffeeDrinksList.tsx
import React, { useState, useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import api from '../api/axiosConfig';
import Icon from 'react-native-vector-icons/FontAwesome';

const primaryColor = '#0f4359'; // Màu chủ xanh dương

interface CoffeeProduct {
  id: string; // Sử dụng string vì ID trong API có thể là string (ObjectId)
  name: string;
  description: string;
  price: number;
  price_s: number;
  price_m: number;
  price_l: number;
  image_url: string; // Cập nhật theo trường dữ liệu của API
}

const CoffeeDrinksList = ({ onPressCoffee }: { onPressCoffee: (item: CoffeeProduct) => void }) => {
  const [coffeeDrinks, setCoffeeDrinks] = useState<CoffeeProduct[]>([]); // Lưu trữ dữ liệu từ API

  useEffect(() => {
    const fetchCoffeeDrinks = async () => {
      try {
        const response = await api.get('coffeeDrinks'); // Thay thế bằng API của bạn
        setCoffeeDrinks(response.data); // Lưu trữ dữ liệu vào state
      } catch (error) {
        console.error('Error fetching coffee drinks:', error);
      }
    };

    fetchCoffeeDrinks();
  }, []);

  return (
    <View>
      <Text style={styles.sectionTitle}>COFFEE DRINKS</Text>
      <FlatList
          horizontal
          data={coffeeDrinks}
          keyExtractor={item => item.id ? item.id.toString() : item.name}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onPressCoffee(item)}>
              <View style={styles.card}>
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>{item.description}</Text>
                  <Text style={styles.productPrice}>
                    ${item.price_s || item.price_m || item.price_l || 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => onPressCoffee(item)}>
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

export default CoffeeDrinksList;
