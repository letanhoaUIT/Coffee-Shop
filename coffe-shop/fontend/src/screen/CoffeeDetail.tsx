import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import api from '../api/axiosConfig';  // Import api từ axiosConfig
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from './context/CartContext';
import { useFavorites } from './context/FavoritesContext';

type CoffeeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CoffeeDetail'>;
type CoffeeDetailScreenRouteProp = RouteProp<RootStackParamList, 'CoffeeDetail'>;

type Props = {
  navigation: CoffeeDetailScreenNavigationProp;
  route: CoffeeDetailScreenRouteProp;
};

const primaryColor = '#0f4359';
const secondaryColor = '#8d6e52';

const CoffeeDetailScreen = ({ route, navigation }: Props) => {
  const { product } = route.params;
  if (!product) {
    return <Text>Product not found</Text>;
  }
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('S');
  const [price, setPrice] = useState(product.price_s);  // Default to small size price
  const [isFavorited, setIsFavorited] = useState(false);  // Trạng thái yêu thích
  const [isLoading, setIsLoading] = useState(false);  // Trạng thái loading khi gọi API
  const { favorites, toggleFavorite, fetchFavorites } = useFavorites();
  // Check if the product is already in the user's favorite list
  useEffect(() => {
    const isFavorite = favorites.some((fav) => fav.product_id === product._id);
    setIsFavorited(isFavorite);
  }, [favorites]);

  // Toggle favorite status (add/remove from favorites)
  const toggleFavorites = async () => {
    try {
      await toggleFavorite({
        _id: product._id,
        product_id: product._id,
        product_type: 'drink',
        productDetails: product,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  // Update the price based on the selected size
  useEffect(() => {
    switch (selectedSize) {
      case 'S':
        setPrice(product.price_s);
        break;
      case 'M':
        setPrice(product.price_m);
        break;
      case 'L':
        setPrice(product.price_l);
        break;
      default:
        setPrice(product.price_s);  // Default case
    }
  }, [selectedSize, product]);


  const handleAddToCart = () => {
    addToCart({ 
      id: product._id,
      name: product.name,
      description: product.description,
      price: price, 
      selectedSize,
      quantity: 1,
      type: 'drink',
      image_url: product.image_url,
      prices: {
        price_s: product.price_s,
        price_m: product.price_m,
        price_l: product.price_l,
      },
      productDetails: product, // Truyền toàn bộ thông tin sản phẩm
    });
    Alert.alert('Sản phẩm đã được thêm vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={30} color='white' />
      </TouchableOpacity>

      <Image source={{ uri: product.image_url }} style={styles.image} />

      <View style={styles.bottom}>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={toggleFavorites}
          disabled={isLoading} // Disable the button during loading
        >
          <Icon name={isFavorited ? 'heart' : 'heart-o'} size={30} color={primaryColor} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>
            {product.description || 'No description available.'}
          </Text>
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
          {['S', 'M', 'L'].map((size) => (
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
  image: {
    width: '100%',
    height: '45%',
    borderBottomLeftRadius: 70,
    borderBottomRightRadius: 70,
  },
  bottom: {
    marginHorizontal: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  infoContainer: {
    marginTop: 16,
  },
  productName: {
    color: primaryColor,
    fontSize: 24,
    fontWeight: 'bold',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    color: '#ffdd00',
    fontSize: 16,
  },
  ratingCount: {
    color: 'gray',
    marginLeft: 8,
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
    paddingHorizontal: 50,
  },
  selectedSizeButton: {
    backgroundColor: secondaryColor,
  },
  sizeText: {
    color: 'white',
    fontSize: 16,
  },
  selectedSizeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceTitle: {
    color: primaryColor,
    fontSize: 18,
    marginTop: 20,
  },
  price: {
    color: primaryColor,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  priceAndCartContainer: {
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
  backButton: {
    position: 'absolute',
    zIndex: 1,
    padding: 20,
    top: 30,
    left: 10,
  },
});

export default CoffeeDetailScreen;
