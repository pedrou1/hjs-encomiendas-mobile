import React, { useContext, useState, useRef, useMemo } from 'react';
import { View, Linking, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_API_KEY = '';

export default function ({ navigation }) {
	const { setUser } = useContext(AuthContext);
	const bottomSheetRef = useRef(null);
	const mapViewRef = useRef(null);
	const autocompleteRef = useRef(null);

	const snapPoints = useMemo(() => ['12%', '80%'], []);

	const [initialPosition, setInitialPosition] = useState({
		latitude: -34.90658452897425,
		longitude: -56.18052889728755,
		latitudeDelta: 0.09,
		longitudeDelta: 0.035,
	});

	const [coordinates, setCoordinates] = useState([
		{ name: 'Direccion1', cliente: 'Juan Perez', latitude: -34.90703478690642, longitude: -56.200666546312526 },
		{ name: 'Direccion2', cliente: 'Juan Perez', latitude: -34.906894010482546, longitude: -56.19176161236216 },
	]);

	const onMarkerPressed = (marker, index) => {};

	const onPedidoPressed = (pedido) => {
		bottomSheetRef.current?.collapse();

		mapViewRef.current?.animateToRegion(
			{
				longitude: pedido.longitude,
				latitude: pedido.latitude,
				latitudeDelta: 0.09,
				longitudeDelta: 0.035,
			},
			1000
		);
	};

	return (
		<Layout>
			<View style={styles.container}>
				<GooglePlacesAutocomplete
					ref={autocompleteRef}
					placeholder="Busca una dirección"
					fetchDetails={true}
					GooglePlacesSearchQuery={{
						rankby: 'distance',
					}}
					onPress={(data, details = null) => {
						autocompleteRef.current?.setAddressText('');
						if (!coordinates.some((c) => c.name == data.description)) {
							setCoordinates([
								...coordinates,
								{ name: data.description, latitude: details.geometry.location.lat, longitude: details.geometry.location.lng },
							]);
						}
					}}
					query={{
						//FIXME .env
						key: GOOGLE_API_KEY,
						language: 'es',
						components: 'country:uy',
						radius: 30000,
						location: `${initialPosition.latitude}, ${initialPosition.longitude}`,
					}}
					styles={{
						container: {
							flex: 1,
							position: 'absolute',
							width: '100%',
							zIndex: 1,
						},
						textInputContainer: {
							color: 'white',
							borderColor: 'grey',
						},
						listView: { backgroundColor: 'white' },
					}}
				/>
				<View style={{ mt: 15 }}>
					<MapView initialRegion={initialPosition} ref={mapViewRef} style={styles.map} provider="google">
						<MapViewDirections
							strokeColor="#ed4c4c"
							strokeWidth={6}
							resetOnChange={true}
							origin={coordinates[0]}
							waypoints={coordinates.slice(1, -1)}
							destination={coordinates[coordinates.length - 1]}
							apikey={GOOGLE_API_KEY}
						/>
						{coordinates.map((marker, index) => (
							<Marker
								key={marker.name}
								onPress={() => onMarkerPressed(marker, index)}
								coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
							>
								<Callout>
									<Text>{marker.name}</Text>
								</Callout>
							</Marker>
						))}
					</MapView>
				</View>
				<BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
					<View style={{ alignItems: 'center', marginBottom: 30 }}>
						<Text
							style={{
								fontSize: 20,
								fontWeight: '600',
								letterSpacing: 0.5,
								paddingBottom: 5,
							}}
						>
							Pedidos
						</Text>
						<Text style={{ letterSpacing: 0.5, color: 'grey' }}>Desplaza hacia arriba</Text>
					</View>

					<BottomSheetFlatList
						data={coordinates}
						renderItem={({ item }) => (
							<TouchableOpacity
								key={item.name}
								onPress={() => {
									onPedidoPressed(item);
								}}
							>
								<View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
									<Text style={{ fontSize: 18, fontWeight: '500' }}>{`${item.name.substring(0, 75)}${
										item.name.length > 75 ? '...' : ''
									}`}</Text>
									<Text style={{ color: 'grey' }}>Juan Perez</Text>
								</View>
							</TouchableOpacity>
						)}
					/>
				</BottomSheet>
			</View>
		</Layout>
	);
}

const styles = StyleSheet.create({
	container: {
		borderTopWidth: 0.5,
		borderColor: 'lightgrey',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	map: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height - 75,
	},
});
