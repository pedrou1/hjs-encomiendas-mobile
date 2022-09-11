import React from 'react';
import { View } from 'react-native';
import { Layout, Button } from 'react-native-rapi-ui';

export default function ({ navigation }) {
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Button
					text="Test"
					onPress={() => {
						navigation.navigate('PantallaTest');
					}}
					style={{
						marginTop: 10,
					}}
				/>
			</View>
		</Layout>
	);
}
