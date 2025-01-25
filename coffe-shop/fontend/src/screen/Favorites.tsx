import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from './context/FavoritesContext';

const backgroundColor = 'white';
const primaryColor = '#0f4359';
const secondaryColor = '#8d6e52';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { favorites, fetchFavorites, toggleFavorite } = useFavorites();
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  // Fetch danh sách yêu thích khi vào màn hình
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Điều hướng dựa trên product_type
  const handlePressFavorite = (item: any) => {
    if (item.product_type === 'drink') {
      navigation.navigate('CoffeeDetail', { product: item.productDetails });
    } else if (item.product_type === 'bean') {
      navigation.navigate('Bean', { product: item.productDetails });
    }
  };

  // Xử lý yêu thích (thêm/xóa)
  const handleFavoriteToggle = async (item: any) => {
    try {
      await toggleFavorite({
        _id: item._id,
        product_id: item.product_id,
        product_type: item.product_type,
        productDetails: item.productDetails,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  // Xử lý thay đổi kích thước
  const handleSizeChange = (productId: string, newSize: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: newSize }));
  };

  // Hiển thị giá dựa trên loại sản phẩm và kích thước
  const getPrice = (item: any) => {
    if (item.product_type === 'bean') {
      const size = selectedSizes[item._id] || '250mg';
      switch (size) {
        case '250mg':
          return item.productDetails?.price_250mg || 0;
        case '500mg':
          return item.productDetails?.price_500mg || 0;
        case '1000mg':
          return item.productDetails?.price_1000mg || 0;
        default:
          return item.productDetails?.price_250mg || 0;
      }
    } else if (item.product_type === 'drink') {
      const size = selectedSizes[item._id] || 'S';
      switch (size) {
        case 'S':
          return item.productDetails?.price_s || 0;
        case 'M':
          return item.productDetails?.price_m || 0;
        case 'L':
          return item.productDetails?.price_l || 0;
        default:
          return item.productDetails?.price_s || 0;
      }
    }
    return 0;
  };

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handlePressFavorite(item)}>
      <View style={styles.favoriteCard}>
        <Image
          source={{
            uri: item?.productDetails?.image_url || 'https://via.placeholder.com/150',
          }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <View style={styles.topSection}>
            <Text style={styles.productName}>
              {item?.productDetails?.name || 'Tên sản phẩm'}
            </Text>
            <Icon
              name="heart"
              size={24}
              color="red"
              onPress={() => handleFavoriteToggle(item)}
              style={styles.heart}
            />
          </View>
          <Text style={styles.description}>
            {item?.productDetails?.description || 'Mô tả sản phẩm'}
          </Text>

          {/* Kích thước và giá */}
          <View style={styles.sizeContainer}>
            {item.product_type === 'bean'
              ? ['250mg', '500mg', '1000mg'].map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      size === selectedSizes[item._id] && styles.selectedSizeButton,
                    ]}
                    onPress={() => handleSizeChange(item._id, size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        size === selectedSizes[item._id] && styles.selectedSizeText,
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
                      size === selectedSizes[item._id] && styles.selectedSizeButton,
                    ]}
                    onPress={() => handleSizeChange(item._id, size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        size === selectedSizes[item._id] && styles.selectedSizeText,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
          </View>

          <Text style={styles.price}>${getPrice(item)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={renderFavoriteItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  title: { color: primaryColor, fontSize: 28, fontWeight: 'bold' },
  favoriteCard: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  image: { width: 100, height: 125 },
  infoContainer: { marginLeft: 16, flex: 1 },
  topSection: { flexDirection: 'row', justifyContent: 'space-between' },
  productName: { fontSize: 18, fontWeight: 'bold' },
  description: { marginVertical: 5 },
  price: { fontSize: 16, fontWeight: 'bold' },
  sizeContainer: { flexDirection: 'row', marginVertical: 8 },
  sizeButton: { backgroundColor: primaryColor, borderRadius: 4, padding: 6, marginRight: 5 },
  selectedSizeButton: { backgroundColor: secondaryColor },
  sizeText: { color: '#fff', fontSize: 12 },
  selectedSizeText: { fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
  heart: { padding: 2, marginRight: 5 },
});

export default FavoritesScreen;
