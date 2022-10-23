import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { View, Linking, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { AuthContext } from '../provider/AuthProvider';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { FAB, Button, Chip } from 'react-native-paper';
import * as Location from 'expo-location';
import * as Constantes from '../utils/Constantes';
import * as pedidosServicio from '../services/pedidos';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';

const GOOGLE_API_KEY = process.env.PLACES_API_BASE.toString();

export default function ({ route, navigation }) {
	const { user, setUser } = useContext(AuthContext);
	const bottomSheetRef = useRef(null);
	const mapViewRef = useRef(null);
	const [ubicacionChofer, setUbicacionChofer] = useState({ latitude: -34.90658452897425, longitude: -56.18052889728755, nombreDireccion: 'Tú' });
	const [optimizando, setOptimizando] = useState(false);
	const [modoRecorrido, setModoRecorrido] = useState(false);
	const snapPoints = useMemo(() => ['15%', '80%'], []);
	const [loading, setLoading] = useState(false);
	const [coordinates, setCoordinates] = useState([]);
	const [coordinatesAux, setCoordinatesAux] = useState([]);
	const [ordenPedidos, setOrdenPedidos] = useState([]);
	const [duracionPedidoRecorriendo, setDuracionPedidoRecorriendo] = useState(null);
	const [contadorCompletado, setContadorCompletado] = useState(1);

	const params = route.params;

	const initialPosition = {
		latitude: ubicacionChofer.latitude,
		longitude: ubicacionChofer.longitude,
		latitudeDelta: 0.09,
		longitudeDelta: 0.035,
	};

	useEffect(() => {
		if (params?.pedidoIngresado) getPedidos();
		if (
			params?.pedidoCancelado &&
			!coordinates.find((c) => c.latitude === params.pedidoCancelado.latitude && c.longitude === params.pedidoCancelado.longitude)
		) {
			setCoordinates([...coordinates, params.pedidoCancelado]);
		} // borrar esto??

		if (params?.coordinates) {
			console.log('coor', params?.coordinates.length);
			setCoordinates(params.coordinates);
		}
	}, [params]);

	useEffect(() => {
		setLoading(true);
		// se carga la ubicacion del chofer actual
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (!status === 'granted') {
				console.log('Debe permitir el acceso a la ubicación');
				return;
			}

			let location = await Location.getCurrentPositionAsync();
			const ubicacionParsed = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				nombreDireccion: 'Tú',
			};
			setUbicacionChofer(ubicacionParsed);
			getPedidos(ubicacionParsed);
		})();
	}, []);

	const optimizarPedidosYGuardar = async (pedidosParsed, ubicacionChofer) => {
		if (pedidosParsed.length >= 2) {
			const origin = ubicacionChofer;
			const waypoints = pedidosParsed;
			const destination = ubicacionChofer;
			const orden = await pedidosServicio.optimizarRuta(origin, waypoints, destination);
			setOrdenPedidos(orden);

			let arra = [];
			if (orden?.length >= 2) {
				orden.map((w) => {
					arra.push(pedidosParsed[w]);
				});
				setCoordinates(arra);
			} else {
				setCoordinates(pedidosParsed);
			}
		} else {
			setCoordinates(pedidosParsed);
		}
	};

	const getPedidos = async (ubicacionChofer) => {
		//obtiene los pedidos de hoy del chofer
		const params = {};
		params.idUsuarioChofer = user.idUsuario;
		params.fecha = new Date();
		const { pedidos, operationResult } = await pedidosServicio.obtenerPedidosPendientesChoferPorDia(params);
		if (operationResult == Constantes.SUCCESS) {
			const pedidosParsed = pedidos.map((p) => {
				return {
					...p,
					key: p.nombreDireccion,
					nombreCliente: p.cliente.nombre + ' ' + p.cliente.apellido,
				};
			});
			await optimizarPedidosYGuardar(pedidosParsed, ubicacionChofer);
			setLoading(false);
		}
	};

	const onPedidoPressed = (pedido) => {
		// se anima a la posicion del pedido
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

	const reloadRoute = async () => {
		setOptimizando(true);
		await optimizarPedidosYGuardar(coordinates, ubicacionChofer);
		setTimeout(() => {
			setOptimizando(false);
		}, 500);
	};

	const activarModoRecorrido = (modoRecorridoIn) => {
		setModoRecorrido(!modoRecorrido);
		if (modoRecorridoIn) setCoordinates(coordinatesAux);
		else {
			setCoordinatesAux([...coordinates]); //.shift()
			//set el primero que no esta entregado y borrarlo de coordinates aux
			setCoordinates([ubicacionChofer, coordinates[0]]);
			setTiempoEntrePuntos(ubicacionChofer, coordinates[0]);
		}
	};

	const abrirGPS = () => {
		bottomSheetRef.current?.snapToIndex(1);
		//abrir el primero que no esta entregado
		const latLng = `${coordinates[1].latitude},${coordinates[1].longitude}`;
		Linking.openURL(`google.navigation:q=${latLng}`);
	};

	const actualizarEstadoPedido = async (pedido, estado) => {
		switch (estado) {
			//actualizar estado en la bd
			case Constantes.ESTADO_PEDIDO_PENDIENTE:
				//en proceso
				break;
			case Constantes.ESTADO_PEDIDO_RETIRADO:
				setLoading(true);
				//elimina el pedido que se marco como retirado de la lista
				const newCoordinates = coordinatesAux.filter((c) => c.latitude != pedido.latitude && c.longitude != pedido.longitude);
				const res = await pedidosServicio.modificarEstadoPedido(pedido.idPedido, Constantes.ESTADO_PEDIDO_RETIRADO);

				if (newCoordinates.length > 0) {
					setCoordinatesAux(newCoordinates);
					setTiempoEntrePuntos(ubicacionChofer, coordinatesAux[1]);
					setCoordinates([ubicacionChofer, coordinatesAux[1]]);
				} else {
					setCoordinates([]);
					setModoRecorrido(false);
					Alert.alert('Completado', 'No tienes mas pedidos por hoy!');
				}
				setTimeout(() => {
					setLoading(false);
					bottomSheetRef.current?.snapToIndex(0);
				}, 200);
				setContadorCompletado(contadorCompletado + 1);
				break;
			case Constantes.ESTADO_PEDIDO_CANCELADO:
				pedido.estado == Constantes.ESTADO_PEDIDO_CANCELADO;
				const resp = await pedidosServicio.modificarEstadoPedido(pedido.idPedido, Constantes.ESTADO_PEDIDO_CANCELADO);
				getPedidos();
				//cancelado
				break;
			default:
				break;
		}
	};

	var distance = require('hpsweb-google-distance');
	distance.apiKey = GOOGLE_API_KEY;

	const setTiempoEntrePuntos = async (origin, destination) => {
		// comparar coordenadas actuales con cada una de las coordenadas de la lista
		origin = `${origin.latitude},${origin.longitude}`;
		destination = `${destination.latitude},${destination.longitude}`;
		distance
			.get({
				origin,
				destination,
				language: 'es',
			})
			.then(function (data) {
				setDuracionPedidoRecorriendo({ tiempo: data.duration, distancia: data.distance });
				//let sorted = els.sort((a, b) => a.distance.value - b.distance.value);
			})
			.catch(function (err) {
				console.log(err);
			});
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
								onPress={async () => {
									await reloadRoute();
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
					<Spinner
						visible={optimizando || loading}
						textContent={'Cargando...'}
						textStyle={{
							color: '#FFF',
							marginBottom: 30,
						}}
						overlayColor="rgba(0, 0, 0, 0.5)"
						size="large"
					/>
					<MapView initialRegion={initialPosition} ref={mapViewRef} style={styles.map} provider="google" showsUserLocation followsUserLocation>
						<MapViewDirections
							strokeColor="#ed4c4c"
							strokeWidth={6}
							optimizeWaypoints={false}
							origin={coordinates[0]}
							waypoints={coordinates.length > 2 ? coordinates.slice(1) : undefined}
							destination={coordinates[coordinates.length > 2 ? 0 : 1]}
							apikey={GOOGLE_API_KEY}
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
										onPress={() => null}
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
								<View
									style={{
										flexDirection: 'row',
										marginLeft: 5,
										marginRight: 5,
										paddingVertical: 5,
										backgroundColor: '#f4f4f4',
										marginTop: 5,
										borderRadius: 15,
										minHeight: 50,
									}}
								>
									<TouchableOpacity
										style={{ width: '70%', flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#d3d3d3' }}
										onPress={() => {
											// onPedidoPressed(item);
											navigation.navigate('VerPedido', { pedido: item, coordinates, modoRecorrido });
										}}
									>
										<View style={{ width: '8%', justifyContent: 'center', marginRight: 5 }}>
											<View
												style={{
													width: 20,
													height: 20,
													justifyContent: 'center',
													borderRadius: 20 / 2,
													backgroundColor: 'grey',
													marginLeft: 2,
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

										<View
											style={{
												width: '95%',
												textAlign: 'center',
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
											}}
										>
											<Text style={{ fontSize: 18, fontWeight: '500' }}>{`${item.nombreDireccion.substring(0, 55)}${
												item.nombreDireccion.length > 55 ? '...' : ''
											}`}</Text>
											{item.cliente && (
												<Text style={{ color: 'grey' }}>{`${item.cliente.nombre} ${
													item.cliente.apellido ? item.cliente.apellido : ''
												}`}</Text>
											)}
										</View>
									</TouchableOpacity>
									{modoRecorrido && index != 0 ? (
										<>
											<TouchableOpacity
												style={{
													width: '15%',
													color: 'white',
													display: 'flex',
													flexDirection: 'row',
													justifyContent: 'center',
													alignItems: 'center',
												}}
												onPress={() => {
													actualizarEstadoPedido(item, Constantes.ESTADO_PEDIDO_CANCELADO);
												}}
											>
												{/* <Text style={{ alignSelf: 'flex-end' }}>Cancelar</Text> */}
												<AntDesign name="closecircleo" size={45} color="#940000" />
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													width: '15%',
													color: 'white',
													display: 'flex',
													flexDirection: 'row',
													justifyContent: 'center',
													alignItems: 'center',
												}}
												onPress={() => {
													actualizarEstadoPedido(item, Constantes.ESTADO_PEDIDO_RETIRADO);
												}}
											>
												{/* <Chip icon="check" onPress={() => console.log('Pressed')}></Chip> */}
												<AntDesign name="checkcircleo" size={45} color={'#005e05'} />
												{/* <Text style={{ alignSelf: 'flex-end', color: 'white' }}>Completado</Text> */}
											</TouchableOpacity>
										</>
									) : (
										<>
											{item.nombreDireccion != 'Tú' && (
												<>
													{item.cliente?.telefono && (
														<TouchableOpacity
															style={{
																width: '15%',
																color: 'white',
																display: 'flex',
																flexDirection: 'row',
																justifyContent: 'center',
																alignItems: 'center',
															}}
															onPress={() => {
																Linking.openURL(`tel:${item.cliente?.telefono}`);
															}}
														>
															<MaterialCommunityIcons name="cellphone" size={40} color="black" />
														</TouchableOpacity>
													)}

													<TouchableOpacity
														style={{
															width: item.cliente?.telefono ? '15%' : '30%',
															color: 'white',
															display: 'flex',
															flexDirection: 'row',
															justifyContent: 'center',
															alignItems: 'center',
														}}
														onPress={() => {
															onPedidoPressed(item);
														}}
													>
														<MaterialCommunityIcons name="map-marker-radius-outline" size={45} color="black" />
														{/* <Text style={{ alignSelf: 'flex-end', color: 'white' }}>DETALLES</Text> */}
													</TouchableOpacity>
												</>
											)}
										</>
									)}
								</View>

								{modoRecorrido && index != 0 && duracionPedidoRecorriendo ? (
									<>
										{coordinates.length > 1 && (
											<>
												<ProgressSteps
													activeStepIconBorderColor={'black'}
													labelColor={'black'}
													activeLabelColor={'black'}
													disabledStepIconColor={'black'}
													progressBarColor={'black'}
													completedProgressBarColor={'black'}
													completedStepIconColor={'grey'}
													completedCheckColor={'grey'}
													completedLabelColor={'grey'}
													labelFontSize={13}
													marginBottom={40}
												>
													{coordinates.map((item, index) => {
														return <ProgressStep label={`${index == 0 ? 'Tú' : 'Pedido'}`} removeBtnRow={true}></ProgressStep>;
													})}
												</ProgressSteps>
											</>
										)}
										<View style={{ marginTop: 5 }}>
											<Text style={{ color: 'grey', alignSelf: 'center' }}>{duracionPedidoRecorriendo.tiempo.toString()}</Text>
											<Text style={{ color: 'grey', alignSelf: 'center' }}>{duracionPedidoRecorriendo.distancia.toString()}</Text>
										</View>
									</>
								) : (
									<></>
								)}
							</View>
						)}
					/>
					{coordinates.length ? (
						<Button
							icon={modoRecorrido ? 'window-close' : 'arrow-right'}
							mode="contained"
							style={{ marginLeft: 15, marginRight: 15, marginBottom: 10, backgroundColor: '#293f6e' }}
							labelStyle={{ fontSize: 25 }}
							onPress={() => {
								setTimeout(() => {
									activarModoRecorrido(modoRecorrido);
								}, 400);
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

// {
// 	nombreDireccion: 'Plaza indep',
// 	nombreCliente: 'Juan Perez',
// 	latitude: -34.90703478690642,
// 	longitude: -56.200666546312526,
// 	key: 'Direccion1',
// 	estado: 1,
// },
// { nombreDireccion: 'tres cr', nombreCliente: 'Juan Perez', latitude: -34.8938251, longitude: -56.1663526, key: 'Direcc11ion1', estado: 1 },
// { nombreDireccion: 'Antel', nombreCliente: 'Juan Perez', latitude: -34.906894010482546, longitude: -56.19176161236216, key: 'Direccion2' },
// { nombreDireccion: 'loi', nombreCliente: 'Juan Perez', latitude: -34.9084324, longitude: -56.1991574, key: '2222' },

//esto estaba en useffect
// al volver a esta pantalla al crear un pedido si no existe el mismo pedido se agrega a la lista
// if (
// 	params?.pedidoIngresado &&
// 	!coordinates.find((c) => c.latitude === params.pedidoIngresado.latitude && c.longitude === params.pedidoIngresado.longitude)
// ) {
// 	setCoordinates([...coordinates, params.pedidoIngresado]);
// }
