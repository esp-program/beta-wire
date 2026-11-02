import React from 'react';
import { CircuitComponent } from '../../types/circuit';
import { ArduinoUnoRealistic } from './ArduinoUnoRealistic';
import { ESP32Realistic } from './ESP32Realistic';
import { BreadboardRealistic } from './BreadboardRealistic';
import { LedRealistic } from './LedRealistic';
import { ResistorRealistic } from './ResistorRealistic';
import { PotentiometerRealistic } from './PotentiometerRealistic';
import { UltrasonicRealistic } from './UltrasonicRealistic';
import { ServoRealistic } from './ServoRealistic';
import { Lcd1602Realistic } from './Lcd1602Realistic';
import { BuzzerRealistic } from './BuzzerRealistic';
import { Dht11Realistic } from './Dht11Realistic';
import { PushbuttonRealistic } from './PushbuttonRealistic';
import { PhotoresistorRealistic } from './PhotoresistorRealistic';
import { PirRealistic } from './PirRealistic';
import { RgbLedRealistic } from './RgbLedRealistic';

interface ComponentRendererProps {
  component: CircuitComponent;
  isSimulating?: boolean;
  pinStates?: Record<string, any>;
  onUpdateConfig?: (compId: string, key: string, val: any) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSimulating = false,
  pinStates = {},
  onUpdateConfig,
}) => {
  const { type, state = {}, customConfig = {} } = component;

  switch (type) {
    case 'arduino-uno':
      return <ArduinoUnoRealistic pinStates={pinStates} isSimulating={isSimulating} />;

    case 'esp32-devkit':
      return <ESP32Realistic pinStates={pinStates} isSimulating={isSimulating} />;

    case 'breadboard':
      return <BreadboardRealistic />;

    case 'led':
      return (
        <LedRealistic
          color={(customConfig.ledColor as any) || 'red'}
          brightness={state.brightness ?? 0}
        />
      );

    case 'rgb-led':
      return (
        <RgbLedRealistic
          r={state.r ?? 0}
          g={state.g ?? 0}
          b={state.b ?? 0}
        />
      );

    case 'resistor':
      return <ResistorRealistic resistance={customConfig.resistance ?? 220} />;

    case 'potentiometer':
      return (
        <PotentiometerRealistic
          value={customConfig.potValue ?? 512}
          onChange={(val) => onUpdateConfig?.(component.id, 'potValue', val)}
        />
      );

    case 'hc-sr04':
      return (
        <UltrasonicRealistic
          distance={customConfig.distance ?? 45}
          onChangeDistance={(dist) => onUpdateConfig?.(component.id, 'distance', dist)}
        />
      );

    case 'sg90-servo':
      return <ServoRealistic angle={state.angle ?? 90} />;

    case 'lcd-1602-i2c':
      return (
        <Lcd1602Realistic
          lines={state.lines || ['  ElectroSim 1.0 ', 'Arduino & ESP32 ']}
          backlight={state.backlight !== false}
        />
      );

    case 'buzzer':
      return (
        <BuzzerRealistic
          isPlaying={state.isPlaying ?? false}
          freq={state.freq ?? 0}
        />
      );

    case 'dht11':
      return (
        <Dht11Realistic
          temperature={customConfig.temperature ?? 24}
          humidity={customConfig.humidity ?? 55}
          onChangeTemp={(t) => onUpdateConfig?.(component.id, 'temperature', t)}
          onChangeHum={(h) => onUpdateConfig?.(component.id, 'humidity', h)}
        />
      );

    case 'pushbutton':
      return (
        <PushbuttonRealistic
          isPressed={customConfig.isPressed ?? false}
          onPressChange={(pressed) => onUpdateConfig?.(component.id, 'isPressed', pressed)}
        />
      );

    case 'photoresistor':
      return (
        <PhotoresistorRealistic
          lightLevel={customConfig.lightLevel ?? 70}
          onChangeLight={(l) => onUpdateConfig?.(component.id, 'lightLevel', l)}
        />
      );

    case 'pir-motion':
      return (
        <PirRealistic
          motionDetected={customConfig.motionDetected ?? false}
          onToggleMotion={(m) => onUpdateConfig?.(component.id, 'motionDetected', m)}
        />
      );

    default:
      return null;
  }
};
