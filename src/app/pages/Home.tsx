import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import {config} from '@gluestack-ui/config';
import ExpenseTrackerGraph from './ExpenseTrackerGraph';
import SpendsInsights from './SpendsInsights';
import Spends from './Spends';
import Nav from './Nav';

const Home = () => {
  return (
    <GluestackUIProvider config={config}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Nav />
          <View style={styles.contentContainer}>
            <View style={styles.graphContainer}>
              <ExpenseTrackerGraph />
            </View>
            <View style={styles.insightsContainer}>
              {/*
                👉 EXERCISE E (docs/frontend-guide/05-hands-on-exercises.md)
                Commented out on purpose — this is just about component
                composition: Home.tsx builds its screen out of smaller
                components (Nav, ExpenseTrackerGraph, SpendsInsights, Spends),
                each in its own file. Removing one from the tree here doesn't
                touch its file or delete it — it just stops rendering.
                Uncomment to bring the insights panel back.
              */}
              <SpendsInsights />
            </View>
          </View>
          <View style={styles.spendsContainer}>
            <Spends />
          </View>
        </View>
      </SafeAreaView>
    </GluestackUIProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    flexDirection: 'column',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  graphContainer: {
    flex: 1,
    marginRight: 10,
  },
  insightsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  spendsContainer: {
    marginTop: 20,
  },
  text: {
    color: 'black',
    fontFamily: 'Roboto',
  },
});

export default Home;
