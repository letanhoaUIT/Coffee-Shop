import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Image, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');  // Chiều rộng màn hình

// Component nhận dữ liệu images từ props
const Banner = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);  // Lưu chỉ số của ảnh hiện tại
  const flatListRef = useRef<FlatList>(null);  // Tham chiếu đến FlatList

  useEffect(() => {
    // Tự động chuyển sang ảnh tiếp theo sau mỗi 3 giây
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);  // Dọn dẹp interval khi component unmount
  }, [images.length]);

  // Khi currentIndex thay đổi, cuộn đến ảnh mới
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: currentIndex, animated: true });
    }
  }, [currentIndex]);  // Chạy lại khi currentIndex thay đổi

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        pagingEnabled // Bật tính năng cuộn từng ảnh một
        onScrollToIndexFailed={(info) => {
          // Xử lý nếu cuộn đến ảnh không thành công
          flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width,
    height: 230, 
    marginVertical: 12,
  },
  imageContainer: {
    width,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  image: {
    width: width - 30, 
    height: 210,  // Chiều cao ảnh
    borderRadius: 10, 
  },
});

export default Banner;
