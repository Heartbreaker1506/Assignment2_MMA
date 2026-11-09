import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { EmptyView } from '../components/EmptyView';
import { Header } from '../components/Header';
import { COLORS } from '../constants/colors';

export const WishlistScreen = ({ navigation }) => {
  const { wishlist, isFavorite, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <View style={styles.container}>
      <Header
        title="Danh sách yêu thích"
        subtitle={`${wishlist.length} sản phẩm`}
      />

      <FlatList
        data={wishlist}
        numColumns={2}
        keyExtractor={(item) => `fav-${item.id}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={(prod) => navigation.navigate('ProductDetail', { productId: prod.id, product: prod })}
            onAddToCart={(prod) => addToCart(prod, 1)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={toggleWishlist}
          />
        )}
        ListEmptyComponent={
          <EmptyView
            icon="heart-outline"
            title="Danh sách yêu thích trống"
            message="Bạn chưa lưu sản phẩm nào. Hãy bấm vào biểu tượng trái tim ở sản phẩm bạn thích nhé!"
            actionLabel="Khám phá ngay"
            onAction={() => navigation.navigate('CatalogTab')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 10,
    paddingBottom: 24,
  },
});

