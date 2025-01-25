import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../api/axiosConfig';  // Import api từ axiosConfig
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useFavorites } from './context/FavoritesContext';
import { useCart } from './context/CartContext';

type CoffeeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CoffeeDetail'>;
type CoffeeDetailScreenRouteProp = RouteProp<RootStackParamList, 'CoffeeDetail'>;

type Props = {
  navigation: CoffeeDetailScreenNavigationProp;
  route: CoffeeDetailScreenRouteProp;
};

const backgroundColor = '#f4f4f4'; // Màu nền sáng
const primaryColor = '#0f4359'; // Màu chủ xanh dương
const secondaryColor = '#8d6e52'; // Màu phụ đất

const BeanDetailScreen = ({ route, navigation }: Props) => {
  const { product } = route.params;
  if (!product) {
    return <Text>Product not found</Text>; // Check if no product is passed
  }

  const { addToCart } = useCart();
  const { favorites,toggleFavorite, fetchFavorites } = useFavorites();
  const [selectedSize, setSelectedSize] = useState('250mg');
  const [price, setPrice] = useState(product.price_250mg);  // Initialize with price_250mg by default
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isFavorite = favorites.some((fav) => fav.product_id === product._id);
    setIsFavorited(isFavorite);
  }, [favorites]);

  const toggleFavorites = async () => {
    try {
      await toggleFavorite({
        _id: product._id,
        product_id: product._id,
        product_type: 'bean',
        productDetails: product,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };
  
  // Update price based on selected size
  useEffect(() => {
    switch (selectedSize) {
      case '250mg':
        setPrice(product.price_250mg);
        break;
      case '500mg':
        setPrice(product.price_500mg);
        break;
      case '750mg':
        setPrice(product.price_1000mg);
        break;
      default:
        setPrice(product.price_250mg);  // Default case
    }
  }, [selectedSize, product]);

  const handleAddToCart = () => {
    addToCart({ 
      id: product._id,
      name: product.name,
      price: price, 
      selectedSize,
      quantity: 1,
      type: 'bean',
      image_url : product.image_url,
      prices: {
        price_250mg: product.price_250mg,
        price_500mg: product.price_500mg,
        price_1000mg: product.price_1000mg,
      },
      productDetails: product,
    });
    Alert.alert('Sản phẩm đã được thêm vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: product.image_url }} style={styles.image} />

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorites} disabled={isLoading}>
          <Icon name={isFavorited ? 'heart' : 'heart-o'} size={30} color={primaryColor} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.origin}>From {product.origin || 'Unknown'}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating || 'N/A'}</Text>
            <Text style={styles.ratingCount}>({product.ratingCount || 'N/A'})</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available for this product.'}
          </Text>
        </View>

        <Text style={styles.sizeTitle}>Size</Text>
        <View style={styles.sizeOptions}>
            {['250mg', '500mg', '1000mg'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        <View style={styles.priceAndCartContainer}>
          <View>
            <Text style={styles.priceTitle}>Price</Text>
            <Text style={styles.price}>${price}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  cartButton: {
    padding: 8,
  },
  bottom: {
    marginHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  image: {
    width: '100%',
    height: '45%',
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  infoContainer: {
    marginTop: 16,
  },
  productName: {
    color: primaryColor,
    fontSize: 24,
    fontWeight: 'bold',
  },
  origin: {
    color: primaryColor,
    fontSize: 16,
    marginVertical: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    color: '#ffdd00',
    fontSize: 16,
  },
  ratingCount: {
    color: 'gray',
    marginLeft: 8,
  },
  priceTitle: {
    color: primaryColor,
    fontSize: 18,
    marginTop: 20,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionTitle: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: primaryColor,
    fontSize: 14,
    lineHeight: 20,
  },
  sizeTitle: {
    color: primaryColor,
    fontSize: 18,
    marginTop: 20,
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sizeButton: {
    backgroundColor: primaryColor,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  selectedSizeButton: {
    backgroundColor: secondaryColor,
  },
  sizeText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedSizeText: {
    fontWeight: 'bold',
  },
  price: {
    color: primaryColor,
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartButton: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 65,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceAndCartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default BeanDetailScreen;
