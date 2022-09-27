import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { View, Linking, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { FAB, Button } from 'react-native-paper';
import * as Location from 'expo-location';

const GOOGLE_API_KEY = process.env.PLACES_API_BASE.toString();

export default function ({ route, navigation }) {
	const { setUser } = useContext(AuthContext);
	const bottomSheetRef = useRef(null);
	const mapViewRef = useRef(null);
	const autocompleteRef = useRef(null);
	const [driverLocation, setDriverLocation] = useState({ latitude: -34.90658452897425, longitude: -56.18052889728755 });
	const [pedidoIngresado, setPedidoIngresado] = useState(null);

	const snapPoints = useMemo(() => ['15%', '80%'], []);

	const params = route.params;

	useEffect(() => {
		if (
			params?.pedidoIngresado &&
			!coordinates.find((c) => c.latitude === params.pedidoIngresado.latitude && c.longitude === params.pedidoIngresado.longitude)
		) {
			setCoordinates([...coordinates, params.pedidoIngresado]);
		}
	}, [params]);

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (!status === 'granted') {
				console.log('Debe permitir el acceso a la ubicación');
				return;
			}

			let location = await Location.getCurrentPositionAsync();
			setDriverLocation({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});
		})();
	}, []);

	// var distance = require('hpsweb-google-distance');
	// distance.apiKey = GOOGLE_API_KEY;

	const [initialPosition, setInitialPosition] = useState({
		// latitude: -34.90658452897425,
		// longitude: -56.18052889728755,
		latitude: driverLocation.latitude,
		longitude: driverLocation.longitude,
		latitudeDelta: 0.09,
		longitudeDelta: 0.035,
	});

	const [coordinates, setCoordinates] = useState([
		{ name: 'Plaza indep', cliente: 'Juan Perez', latitude: -34.90703478690642, longitude: -56.200666546312526, key: 'Direccion1' },
		{ name: 'tres cr', cliente: 'Juan Perez', latitude: -34.8938251, longitude: -56.1663526, key: 'Direcc11ion1' },
		{ name: 'Antel', cliente: 'Juan Perez', latitude: -34.906894010482546, longitude: -56.19176161236216, key: 'Direccion2' },
		{ name: 'loi', cliente: 'Juan Perez', latitude: -34.9084324, longitude: -56.1991574, key: '2222' },
	]);

	//comparar coordenadas actuales con cada una de las coordenadas de la lista
	// useEffect(() => {
	// 	distance
	// 		.get({
	// 			origin: '-34.90703478690642, -56.200666546312526',
	// 			destination: '-34.8938251, -56.1663526',
	// 		})
	// 		.then(function (data) {
	// 			console.log(data);
	// 			let sorted = els.sort((a, b) => a.distance.value - b.distance.value);
	// 		})
	// 		.catch(function (err) {
	// 			console.log(err);
	// 		});
	// });
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
						console.log({ latitude: details.geometry.location.lat, longitude: details.geometry.location.lng });
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
					<MapView initialRegion={initialPosition} ref={mapViewRef} style={styles.map} provider="google" showsUserLocation followsUserLocation>
						<MapViewDirections
							strokeColor="#ed4c4c"
							strokeWidth={6}
							// resetOnChange={true}
							optimizeWaypoints={true}
							origin={coordinates[0]}
							waypoints={coordinates.slice(1)}
							destination={coordinates[0]}
							apikey={GOOGLE_API_KEY}
							// onStart={(e) => {
							// 	console.log('onStart: ', e);
							// 	setCoordinates([e.origin]);
							// }}
							onReady={(e) => {
								// console.log('onReady: ', e);
								let arra = [];
								e.waypointOrder.map((wp) => {
									arra.push(coordinates[0]);
									wp.map((w) => {
										// console.log(w);
										arra.push(coordinates[w + 1]);
									});
									// coordinates.map((c, i) => {
									// 	if(i== 0 ){arra.push(coordinates[0])}
									// 	else{
									// 		arra.push(coordinates[c])
									// 	}
									// })
								});
								setCoordinates(arra);
							}}
							// onError={(e) => {
							// 	console.log('err: ', e);
							// }}
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
						<FAB
							icon="plus"
							style={styles.fab}
							onPress={() => {
								navigation.navigate('SeleccionarDireccion');
							}}
						/>
						<Text style={{ letterSpacing: 0.5, color: 'grey' }}>Desplaza hacia arriba</Text>
					</View>

					<BottomSheetFlatList
						data={coordinates}
						renderItem={({ item, index }) => (
							<View key={item.name}>
								<View style={{ flexDirection: 'row', marginLeft: 10, paddingVertical: 5 }}>
									<TouchableOpacity
										style={{ backgroundColor: 'yellow', width: '70%', flexDirection: 'row' }}
										onPress={() => {
											onPedidoPressed(item);
										}}
									>
										<View style={{ width: '5%' }}>
											<Text>{index + 1}</Text>
										</View>
										<View style={{ width: '95%' }}>
											<Text style={{ fontSize: 18, fontWeight: '500' }}>{`${item.name.substring(0, 75)}${
												item.name.length > 75 ? '...' : ''
											}`}</Text>
											<Text style={{ color: 'grey' }}>Juan Perez</Text>
										</View>
									</TouchableOpacity>
									<TouchableOpacity
										style={{ width: '30%' }}
										onPress={() => {
											onPedidoPressed(item);
										}}
									>
										{/* despues de apretar esto tiene que aparecer un boton de iniciar gps */}
										<Text style={{ alignSelf: 'flex-end' }}>Ver ruta</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					/>
					<Button
						icon="plus"
						mode="contained"
						// style={{ width: 200, height: 50 }} // backgroundColor: '748DA6'
						style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: '#6377A4' }}
						labelStyle={{ fontSize: 25 }}
						onPress={() => navigation.navigate('SeleccionarDireccion')}
					>
						<Text style={{ fontSize: 17, color: 'white' }}>Nuevo</Text>
					</Button>
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
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
});
