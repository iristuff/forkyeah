import React from 'react';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import QuestDetailScreen from '../screens/QuestDetailScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import HomeScreen        from '../screens/HomeScreen';
import FeedScreen        from '../screens/FeedScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AIScreen          from '../screens/AIScreen';
import ProfileScreen     from '../screens/ProfileScreen';
import QuestScreen       from '../screens/QuestScreen';
import { Colors, BorderRadius } from '../constants/theme';

export type RootTabParamList = {
  Home:        undefined;
  Feed:        undefined;
  Leaderboard: undefined;
  AI:          undefined;
  Profile:     undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain"     component={HomeScreen} />
      <Stack.Screen name="Quests"       component={QuestScreen} />
      <Stack.Screen name="QuestDetail"  component={QuestDetailScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
    </Stack.Navigator>
  );
}

const TAB_CONFIG = {
  Home:        { emoji: '🏠', label: 'Home'      },
  Feed:        { emoji: '🌍', label: 'Feed'      },
  Leaderboard: { emoji: '🏆', label: 'Ranks'     },
  AI:          { emoji: '🤖', label: 'Sous Chef' },
  Profile:     { emoji: '👤', label: 'Profile'   },
} as const;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];
            return (
              <View style={focused ? styles.activeIconWrap : null}>
                <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
                  {config.emoji}
                </Text>
              </View>
            );
          },
          tabBarLabel: ({ focused }) => {
            const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];
            return (
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {config.label}
              </Text>
            );
          },
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          tabBarActiveTintColor:   Colors.spice,
          tabBarInactiveTintColor: Colors.textMuted,
        })}
      >
        <Tab.Screen name="Home"        component={HomeStack}         />
        <Tab.Screen name="Feed"        component={FeedScreen}        />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="AI"          component={AIScreen}          />
        <Tab.Screen name="Profile"     component={ProfileScreen}     />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(14,14,22,0.97)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 82 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  tabItem:        { paddingTop: 4 },
  tabEmoji:       { fontSize: 22 },
  tabEmojiActive: { transform: [{ scale: 1.15 }] },
  activeIconWrap: {
    borderTopWidth: 3,
    borderTopColor: Colors.spice,
    borderRadius: BorderRadius.xs,
    paddingTop: 6,
    marginTop: -9,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  tabLabelActive: { color: Colors.spice },
});