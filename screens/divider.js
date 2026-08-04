import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../colors';

const Divider = () => {
  return (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    paddingHorizontal: 20,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});

export default Divider;