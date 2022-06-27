import React, { useState, useEffect } from 'react'
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, Modal, Pressable, Vibration } from 'react-native'
import { VLCPlayer } from 'react-native-vlc-media-player'
import MQTT from 'sp-react-native-mqtt'
import haversine from 'haversine-distance'
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage'

const calcVLCPlayerHeight = (windowWidth, aspetRatio) => {
    return windowWidth * aspetRatio
}

let mqttClient = null

export default function Home({ navigation }) {

    const DURATION = 1000;

    const [alarme, setAlarme] = useState(true)
    const [alarmeStatus, setAlarmeStatus] = useState('desligado')
    const [modalAlarme, setModalAlarme] = useState(false)
    const [portaoStatus, setPortaoStatus] = useState(null)
    const [rtsp, setRtsp] = useState(null)
    const [haversineM, setHaversineM] = useState(100)
    const [latitudeUser, onChangeLatitude] = useState('')
    const [longitudeUser, onChangeLontitude] = useState('')
    const [isEnabledPortaoAutomatico, setIsEnabledPortaoAutomatico] = useState(false)
    const [isEnabledLuzAutomatica, setIsEnabledPortaoLuzAutomatica] = useState(false)
    const [isEnabledLuzAlarmeAutomatico, setIsEnabledLuzAlarmeAutomatico] = useState(false)

    useEffect(() => {
        if (isEnabledPortaoAutomatico) {
            Geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ latitude, longitude })
                    let point1 = { lat: Number(latitudeUser), lng: Number(longitudeUser) }
                    let point2 = { lat: latitude, lng: longitude }
                    let haversine_m = haversine(point1, point2)
                    setHaversineM(haversine_m.toFixed(1))
                }, error => {
                    console.log(error);
                },
                {
                    forceRequestLocation: true,
                    enableHighAccuracy: true,
                    forceLocationManager: true,
                    distanceFilter: 0,
                    interval: 5000,
                    fastestInterval: 3000,
                    maximumAge: 0
                }
            )
        }
    }, [isEnabledPortaoAutomatico]);

    useEffect(() => {
        if (haversineM < 10) {
            if (portaoStatus) return
            mqttClient.publish('garagem/portao', 'abrir', 0, false)
            if (isEnabledLuzAutomatica) mqttClient.publish('garagem/luz', 'ligar', 0, false)
            setHaversineM(100)
            setPortaoStatus(true)
        }
    }, [haversineM])


    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const rtsp = await AsyncStorage.getItem('rtsp')
                const mqttBroker = await AsyncStorage.getItem('mqttBroker')
                const user = await AsyncStorage.getItem('user')
                const password = await AsyncStorage.getItem('password')
                console.log("RTSP***", rtsp)
                setRtsp(rtsp)
                setMqttBroker(mqttBroker)
                setUser(user)
                setPassword(password)

                let lat = await AsyncStorage.getItem('latitude')
                let lng = await AsyncStorage.getItem('longitude')
                let pA = await AsyncStorage.getItem('portaoAutomatico')
                let lA = await AsyncStorage.getItem('luzAutomatica')
                let lAA = await AsyncStorage.getItem('luzAlarmeAutomatico')

                onChangeLatitude(lat)
                onChangeLontitude(lng)
                setIsEnabledPortaoAutomatico(!!pA)
                setIsEnabledPortaoLuzAutomatica(lA)
                setIsEnabledLuzAlarmeAutomatico(lAA)

            } catch (err) {
                console.log('DADOS - ERRO', err)
            }
        }
        bootstrapAsync()
    }, [])

    const [watchID, setWatchID] = useState(0);

    useEffect(() => {
        const bootstrapAsync = async () => {
            const uri = await AsyncStorage.getItem('mqttBroker')
            mqttClient = await MQTT.createClient({
                uri: `${uri}`,
                clientId: 'smartphone',
            })
            mqttClient.on('connect', () => {
                console.log('[MQTT] Connected')
                mqttClient.subscribe('garagem/alarme', 0)
                mqttClient.subscribe('teste', 0)
            })

            mqttClient.on('closed', () => {
                console.log('[MQTT Event closed')
            })

            mqttClient.on('message', (msg) => {
                if (msg.data == 'ligado' && msg.topic == 'garagem/alarme') {
                    setAlarmeStatus('ligado')
                } else {
                    setAlarmeStatus('desligado')
                }

            })

            mqttClient.on('error', (msg) => {
                console.log('[MQTT] Error occured: ', msg)
            })

            mqttClient.connect()
        }
        bootstrapAsync()
    }, [])

    useEffect(() => {
        if (alarme && alarmeStatus == 'ligado') {
            if (isEnabledLuzAlarmeAutomatico == 'true') mqttClient.publish('garagem/luz', 'ligar', 0, false)
            setModalAlarme(true)
            Vibration.vibrate(DURATION)
        } else {
            Vibration.cancel()
        }
    }, [alarmeStatus])

    return (
        <View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAlarme}
                onRequestClose={() => {
                    if (isEnabledLuzAlarmeAutomatico) mqttClient.publish('garagem/luz', 'desligar', 0, false)
                    Vibration.cancel()
                    setModalAlarme(!modalAlarme);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    marginTop: '90%'
                }}>
                    <View style={{
                        margin: 10,
                        backgroundColor: "red",
                        borderRadius: 20,
                        paddingHorizontal: 45,
                        alignItems: "center",
                        shadowColor: "#000",
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        paddingVertical: 65
                    }}>

                        <Text style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: 20,
                            fontSize: 17
                        }}>⚠️MOVIMENTO DETECTADO!⚠️</Text>

                        <Pressable
                            style={[{
                                borderRadius: 5,
                                padding: 10,
                                elevation: 2
                            }, {
                                backgroundColor: "#000",
                            }]}
                            onPress={() => {
                                if (isEnabledLuzAlarmeAutomatico) mqttClient.publish('garagem/luz', 'desligar', 0, false)
                                Vibration.cancel()
                                setModalAlarme(!modalAlarme)
                            }}
                        >
                            <Text style={{
                                color: "#fff",
                                fontWeight: "bold",
                                textAlign: "center"
                            }}>DESATIVAR</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {rtsp ?
                <VLCPlayer
                    style={{ height: calcVLCPlayerHeight(Dimensions.get('window').width, 3 / 4) }}
                    videoAspectRatio="16:9"
                    source={{ uri: rtsp }}
                />
                : <Text>CARREGANDO CÂMERA...</Text>}


            <View style={{ ...styles.container }}>
                <View style={{ ...styles.buttonCointainer }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => mqttClient.publish('garagem/luz', 'ligar', 0, false)}>
                        <Text style={{ ...styles.buttonText }}>LIGAR LUZ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => mqttClient.publish('garagem/luz', 'desligar', 0, false)}>
                        <Text style={{ ...styles.buttonText }}>DESLIGAR LUZ</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ ...styles.buttonCointainer }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            mqttClient.publish('garagem/portao', 'abrir', 0, false)
                            if (isEnabledLuzAutomatica) mqttClient.publish('garagem/luz', 'ligar', 0, false)
                        }}>
                        <Text style={{ ...styles.buttonText }}>ABRIR PORTÃO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            mqttClient.publish('garagem/portao', 'fechar', 0, false)
                        }}>
                        <Text style={{ ...styles.buttonText }}>FECHAR PORTÃO</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ ...styles.buttonCointainer }}>
                    <TouchableOpacity
                        style={alarme == true ? { ...styles.button, backgroundColor: 'green' } : { ...styles.button, backgroundColor: 'red' }}
                        onPress={() => alarme ? setAlarme(false) : setAlarme(true)}>
                        <Text style={{ ...styles.buttonText }}>ALARME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Opcoes')}>
                        <Text style={{ ...styles.buttonText }}>OPÇÕES</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        width: '40%',
        padding: 10,
        backgroundColor: "#000",
        borderRadius: 5
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff'
    },
    container: {},
    buttonCointainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30
    }
})
