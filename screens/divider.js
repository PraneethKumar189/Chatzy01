import React from 'react';
import { View, StyleSheet } from 'react-native';

const Divider = () => {
  return <View style={styles.divider} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1, // Height of the line
    backgroundColor: '#cccccc', // Color of the line
    marginVertical: 10, // Space around the line
  },
});

export default Divider;