// ─────────────────────────────────────────────────────────────
// navigation/AppNavigator.tsx
// Bottom tab navigator — 5 tabs matching the HTML prototype
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen        from '../screens/HomeScreen';
import FeedScreen        from '../screens/FeedScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import AIScreen          from '../screens/AIScreen';
import ProfileScreen     from '../screens/ProfileScreen';

import { Colors, BorderRadius } from '../constants/theme';

// ── Tab Param List (TypeScript type safety for navigation) ────
export type RootTabParamList = {
  Home:        undefined;
  Feed:        undefined;
  Leaderboard: undefined;
  AI:          undefined;
  Profile:     undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// ── Tab icon config ───────────────────────────────────────────
const TAB_CONFIG = {
  Home:        { emoji: '🏠', label: 'Home'      },
  Feed:        { emoji: '🌍', label: 'Feed'      },
  Leaderboard: { emoji: '🏆', label: 'Ranks'     },
  AI:          { emoji: '🤖', label: 'Sous Chef' },
  Profile:     { emoji: '👤', label: 'Profile'   },
} as const;

// ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          // ── Tab Bar Icon ─────────────────────────────────
          tabBarIcon: ({ focused }) => {
            const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];
            return (
              <View style={focused ? styles.activeIconWrap : null}>
                <Text
                  style={[
                    styles.tabEmoji,
                    focused && styles.tabEmojiActive,
                  ]}
                >
                  {config.emoji}
                </Text>
              </View>
            );
          },

          // ── Tab Bar Label ─────────────────────────────────
          tabBarLabel: ({ focused }) => {
            const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];
            return (
              <Text
                style={[
                  styles.tabLabel,
                  focused && styles.tabLabelActive,
                ]}
              >
                {config.label}
              </Text>
            );
          },

          // ── Tab Bar Style ─────────────────────────────────
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,

          // Active/inactive colors (used as fallback)
          tabBarActiveTintColor:   Colors.spice,
          tabBarInactiveTintColor: Colors.textMuted,
        })}
      >
        <Tab.Screen name="Home"        component={HomeScreen}        />
        <Tab.Screen name="Feed"        component={FeedScreen}        />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Tab.Screen name="AI"          component={AIScreen}          />
        <Tab.Screen name="Profile"     component={ProfileScreen}     />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(14,14,22,0.97)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 82 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    // Subtle shadow on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabEmojiActive: {
    transform: [{ scale: 1.15 }],
  },
  activeIconWrap: {
    // Top active indicator line (matches HTML prototype's ::before pseudo element)
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
  tabLabelActive: {
    color: Colors.spice,
  },
});
