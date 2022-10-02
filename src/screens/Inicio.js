import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { View, Linking, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import { FAB, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import * as Constantes from '../utils/Constantes';
import * as pedidosServicio from '../services/pedidos';

const GOOGLE_API_KEY = process.env.PLACES_API_BASE.toString();

export default function ({ route, navigation }) {
	const { setUser } = useContext(AuthContext);
	const bottomSheetRef = useRef(null);
	const mapViewRef = useRef(null);
	const autocompleteRef = useRef(null);
	const [driverLocation, setDriverLocation] = useState({ latitude: -34.90658452897425, longitude: -56.18052889728755, nombreDireccion: 'Tú' });
	const [optimizando, setOptimizando] = useState(false);
	const [modoRecorrido, setModoRecorrido] = useState(null);

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
				nombreDireccion: 'Tú',
			});
		})();

		getPedidos();
	}, []);

	const getPedidos = async () => {
		const params = {};
		params.idUsuarioChofer = 8; //FIXME CAMBIAR POR USUARIO CHOFER LOGEADO
		const { pedidos, operationResult } = await pedidosServicio.obtenerPedidosChoferPorDia(params);
		if (operationResult == Constantes.SUCCESS) {
			//setear array
			console.log(pedidos);
		}
	};

	const [initialPosition, setInitialPosition] = useState({
		latitude: driverLocation.latitude,
		longitude: driverLocation.longitude,
		latitudeDelta: 0.09,
		longitudeDelta: 0.035,
	});

	const [coordinates, setCoordinates] = useState([
		{
			nombreDireccion: 'Plaza indep',
			nombreCliente: 'Juan Perez',
			latitude: -34.90703478690642,
			longitude: -56.200666546312526,
			key: 'Direccion1',
			estado: 1,
		},
		{ nombreDireccion: 'tres cr', nombreCliente: 'Juan Perez', latitude: -34.8938251, longitude: -56.1663526, key: 'Direcc11ion1', estado: 1 },
		{ nombreDireccion: 'Antel', nombreCliente: 'Juan Perez', latitude: -34.906894010482546, longitude: -56.19176161236216, key: 'Direccion2' },
		// { nombreDireccion: 'loi', nombreCliente: 'Juan Perez', latitude: -34.9084324, longitude: -56.1991574, key: '2222' },
	]);

	const [coordinatesAux, setCoordinatesAux] = useState([]);

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

	const reloadRoute = () => {
		const coorCopy = coordinates;
		setCoordinates([]);

		setTimeout(() => {
			setCoordinates(coorCopy);
			setOptimizando(false);
		}, 500);
	};

	const activarModoRecorrido = (modoRecorridoIn) => {
		setModoRecorrido(!modoRecorrido);
		if (modoRecorridoIn) setCoordinates(coordinatesAux);
		else {
			setCoordinatesAux(coordinates.shift());
			//set el primero que no esta entregado y borrarlo de coordinates aux
			setCoordinates([driverLocation, coordinates[0]]);
		}
	};

	const abrirGPS = () => {
		//abrir el primero que no esta entregado
		const latLng = `${coordinates[1].latitude},${coordinates[1].longitude}`;
		Linking.openURL(`google.navigation:q=${latLng}`);
	};

	const actualizarEstadoPedido = (pedido, estado) => {
		//switch estado update coordinates pedido
		switch (estado) {
			case 1:
				//en proceso
				break;
			case 2:
				//entregado
				// eliminar de la llista?? y dejarlo en otra auxiliar para mostrar en el historial??
				//actualizar estado en la bd
				console.log('entregado');
				const newCoordinates = coordinatesAux.filter((c) => c.latitude != pedido.latitude && c.longitude != pedido.longitude);
				setCoordinatesAux(newCoordinates);
				setCoordinates([driverLocation, coordinatesAux[0]]);
				break;
			case 3:
				//cancelado
				break;
			default:
				break;
		}
	};

	return (
		<Layout>
			<View style={styles.container}>
				{coordinates.length || optimizando ? (
					<>
						{!modoRecorrido ? (
							<FAB
								label={!optimizando ? 'Optimizar' : 'Cargando'}
								icon={!optimizando ? 'map-marker-radius-outline' : 'reload'}
								contentStyle={{ flexDirection: 'row-reverse' }}
								style={styles.fab}
								color="white"
								customSize={45}
								onPress={() => {
									setOptimizando(true);
									reloadRoute();
								}}
							/>
						) : (
							<FAB
								label={'Iniciar GPS'}
								icon={!optimizando ? 'map-marker-radius-outline' : 'reload'}
								contentStyle={{ flexDirection: 'row-reverse' }}
								style={styles.fab}
								color="white"
								customSize={45}
								onPress={() => {
									abrirGPS();
								}}
							/>
						)}
					</>
				) : (
					<FAB
						label={'Agrega un pedido'}
						icon={'arrow-down'}
						contentStyle={{ flexDirection: 'row-reverse' }}
						style={styles.fab}
						color="white"
						customSize={45}
						onPress={() => {
							bottomSheetRef.current?.snapToIndex(1);
						}}
					/>
				)}

				<View style={{ mt: 15 }}>
					<MapView initialRegion={initialPosition} ref={mapViewRef} style={styles.map} provider="google" showsUserLocation followsUserLocation>
						<MapViewDirections
							strokeColor="#ed4c4c"
							strokeWidth={6}
							// resetOnChange={true}
							optimizeWaypoints={true}
							origin={coordinates[0]}
							waypoints={coordinates.length > 2 ? coordinates.slice(1) : undefined}
							destination={coordinates[coordinates.length > 2 ? 0 : 1]}
							apikey={GOOGLE_API_KEY}
							// onStart={(e) => {
							// 	console.log('onStart: ', e);
							// 	setCoordinates([e.origin]);
							// }}
							onReady={(e) => {
								// console.log('onReady: ', e);
								let arra = [];
								if (coordinates.length > 2) {
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
								}
							}}
						/>
						{coordinates.map((marker, index) => (
							<View key={marker.nombreDireccion}>
								{index != 0 ? (
									<Marker
										key={marker.nombreDireccion}
										coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
										//pinColor="#3d34eb"
										image={require('../assets/map-marker.png')}
									>
										<Callout>
											<Text>{marker.nombreDireccion}</Text>
										</Callout>
									</Marker>
								) : (
									<Marker
										key={marker.nombreDireccion}
										onPress={() => onMarkerPressed(marker, index)}
										coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
										image={require('../assets/google-maps.png')}
									>
										<Callout>
											<Text>{marker.nombreDireccion}</Text>
										</Callout>
									</Marker>
								)}
							</View>
						))}
					</MapView>
					{/* <Callout>
					{index == 0 && (
									<Marker key={marker.nombreDireccion + index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}>
										<Text>{'marker.nombreDireccion'}</Text>
									</Marker>
								)}
									<Text>{marker.nombreDireccion}</Text>
								</Callout> */}
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
						renderItem={({ item, index }) => (
							<View key={item.nombreDireccion}>
								<View style={{ flexDirection: 'row', marginLeft: 10, paddingVertical: 5 }}>
									<TouchableOpacity
										style={{ backgroundColor: 'yellow', width: '70%', flexDirection: 'row' }}
										onPress={() => {
											onPedidoPressed(item);
										}}
									>
										<View style={{ width: '8%', justifyContent: 'center' }}>
											<View
												style={{
													width: 20,
													height: 20,
													justifyContent: 'center',
													borderRadius: 20 / 2,
													backgroundColor: 'grey',
												}}
											>
												<Text
													style={{
														alignSelf: 'center',
														fontWeight: 'bold',
														color: 'white',
														fontSize: 15,
													}}
												>
													{index + 1}
												</Text>
											</View>
										</View>
										{/* <View
											style={{ width: '5%', justifyContent: 'center', backgroundColor: 'red', height: 30, width: 30, borderRadius: 15 }}
										>
											<Text>{index + 1}</Text>
										</View> */}
										<View style={{ width: '95%' }}>
											<Text style={{ fontSize: 18, fontWeight: '500' }}>{`${item.nombreDireccion.substring(0, 75)}${
												item.nombreDireccion.length > 75 ? '...' : ''
											}`}</Text>
											<Text style={{ color: 'grey' }}>Juan Perez</Text>
										</View>
									</TouchableOpacity>
									<TouchableOpacity
										style={{ width: '15%', backgroundColor: 'red', color: 'white' }}
										onPress={() => {
											onPedidoPressed(item);
										}}
									>
										{/* despues de apretar esto tiene que aparecer un boton de iniciar gps */}
										<Text style={{ alignSelf: 'flex-end' }}>Cancelar</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={{ width: '15%', backgroundColor: 'green' }}
										onPress={() => {
											actualizarEstadoPedido(item, 2);
										}}
									>
										{/* despues de apretar esto tiene que aparecer un boton de iniciar gps */}
										<Text style={{ alignSelf: 'flex-end', color: 'white' }}>Completado</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					/>
					{coordinates.length ? (
						<Button
							icon={modoRecorrido ? 'window-close' : 'arrow-right'}
							mode="contained"
							// style={{ width: 200, height: 50 }} // backgroundColor: '748DA6'
							style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: '#293f6e' }}
							labelStyle={{ fontSize: 25 }}
							onPress={() => {
								activarModoRecorrido(modoRecorrido);
							}}
						>
							<Text style={{ fontSize: 17, color: 'white' }}>{modoRecorrido ? 'Terminar recorrido' : 'Iniciar recorrido'}</Text>
						</Button>
					) : (
						<></>
					)}
					{!modoRecorrido && (
						<Button
							icon="plus"
							mode="contained"
							// style={{ width: 200, height: 50 }} // backgroundColor: '748DA6'
							style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: '#485778' }}
							labelStyle={{ fontSize: 25 }}
							onPress={() => navigation.navigate('SeleccionarDireccion')}
						>
							<Text style={{ fontSize: 17, color: 'white' }}>Nuevo</Text>
						</Button>
					)}
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
		margin: 10,
		position: 'absolute',
		zIndex: 1,
		flexDirection: 'row-reverse',
		backgroundColor: '#1b2a4a',
	},
});

// var distance = require('hpsweb-google-distance');
// distance.apiKey = GOOGLE_API_KEY;
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

{
	/* <GooglePlacesAutocomplete
					ref={autocompleteRef}
					placeholder="Busca una dirección"
					fetchDetails={true}
					GooglePlacesSearchQuery={{
						rankby: 'distance',
					}}
					onPress={(data, details = null) => {
						autocompleteRef.current?.setAddressText('');
						console.log({ latitude: details.geometry.location.lat, longitude: details.geometry.location.lng });
						if (!coordinates.some((c) => c.nombreDireccion == data.description)) {
							setCoordinates([
								...coordinates,
								{ nombreDireccion: data.description, latitude: details.geometry.location.lat, longitude: details.geometry.location.lng },
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
				/> */
}
