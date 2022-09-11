import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/provider/AuthProvider';
import { ThemeProvider } from 'react-native-rapi-ui';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

LogBox.ignoreLogs([
	'Warning: Async Storage has been extracted from react-native core',
	'VirtualizedList: missing keys for items, make sure to specify a key or id',
]);

export default function App() {
	const images = [require('./assets/icon.png'), require('./assets/splash.png'), require('./assets/login.png')];
	return (
		<ThemeProvider images={images}>
			<AuthProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<AppNavigator />
				</GestureHandlerRootView>
			</AuthProvider>
		</ThemeProvider>
	);
}
