import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Barometer } from 'expo-sensors';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';
import { Card } from 'react-native-paper';

export default function App(props) {

  const PRESSURE_STANDARD_ATMOSPHERE = 1013.25 // 1013.25
  const TAKEOFF_DETECT_DELTA = 1;

  const [data, setData] = useState({});
  const [takeoff, setTakeoff] = useState({});
  const [timestamp, setTimestamp] = useState(0);
  const stateRef = useRef();
  stateRef.current = timestamp;

  useEffect(async () => {
    _initialize();
    _getTakeoffAltitude();
    _toggle();
  }, []);

  useEffect(() => {
    return () => {
      _unsubscribe();
    };
  }, []);

  const _toggle = () => {
    if (this._subscription) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  };

  const _subscribe = () => {
    this._subscription = Barometer.addListener(barometerData => {
      let alt = Math.round(_getAltitude(PRESSURE_STANDARD_ATMOSPHERE, barometerData.pressure));
      barometerData.altitudeAmsl = alt;
      barometerData.altitudeDelta = alt - takeoff.takeoffAltitude; 
      if ((stateRef.current === 0) && ((alt - takeoff.takeoffAltitude) > TAKEOFF_DETECT_DELTA)) {
        _takeoffDetected(new Date().getTime());
      }
      setData(barometerData);
      
    });
  };

  const _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };

  const _getAltitude = (p0, p) => {
    return 44330 * (1 - Math.pow(p / p0, 1.0 / 5.255));
  }

  const _initialize = async () => {
    /*let { status } = await Barometer.isAvailableAsync();
      if (!status) {
        console.error('No barometer sensor available');
        return;
      }*/
  }

  const _getTakeoffAltitude = () => {
    let sub = Barometer.addListener(barometerData => {
      takeoff.takeoffPressure = barometerData.pressure;
      takeoff.takeoffAltitude = Math.round(_getAltitude(PRESSURE_STANDARD_ATMOSPHERE, barometerData.pressure)-1); 
      setTakeoff(takeoff);
      sub.remove();
    });    
  }

  const _takeoffDetected = (ts) => {
    setTimestamp(ts);
    Speech.speak('FlightVoice takeoff, altitude ' + takeoff.takeoffAltitude + 'meters, have an amazing flight !', {
      rate: 0.33,
      volume: 100 
    });
  }

  const { 
    pressure = -1,
    relativeAltitude = -1, 
    //
    altitudeAmsl = -1,
    altitudeDelta = -1
  } = data;

  const {
    takeoffPressure = -1,
    takeoffAltitude = -1
  } = takeoff;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FlightVoice v0.1</Text>
      <Card>
        <Text style={styles.paragraph}>Takeoff altitude: {takeoffAltitude} m AMSL</Text>
        <Text style={styles.paragraph}>Takeoff time: {new Date(timestamp).toLocaleTimeString()}</Text>
        <Text style={styles.paragraph}>Current altitude: {altitudeAmsl} m AMSL</Text>
        <Text style={styles.paragraph}>Altitude delta: {altitudeDelta} m AMSL</Text>
      </Card>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={_toggle} style={styles.button}>
          <Text>Toggle barometer updates</Text>
        </TouchableOpacity>        
      </View>   
      <Text style={styles.mini}>Pressure: {pressure} hPa</Text>  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
   buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
    padding: 10,
  },
  mini: {
    textAlign: 'center',
    marginTop: 10
  },
  header: {
    margin: 30,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});