import { Button, HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { TimerSurfaceProps } from "./timerSurfaceTypes";

const TimoWidgetLayout = (
  props: TimerSurfaceProps,
  environment: WidgetEnvironment,
) => {
  "widget";

  const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`);
  const formatMs = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(minutes)}:${pad2(seconds)}`;
  };

  const toggle = (): TimerSurfaceProps => {
    if (props.isActive && props.targetEndTime > 0) {
      const remainingMs = Math.max(0, props.targetEndTime - Date.now());
      return {
        ...props,
        isActive: false,
        targetEndTime: 0,
        startedAt: 0,
        remainingMs,
        label: "Paused",
      };
    }

    const duration = props.remainingMs > 0 ? props.remainingMs : props.durationMs;
    const now = Date.now();
    return {
      ...props,
      isActive: true,
      targetEndTime: now + duration,
      startedAt: now,
      remainingMs: duration,
      label: "Focus",
    };
  };

  const isSmall = environment.widgetFamily === "systemSmall";
  const timeSize = isSmall ? 36 : 44;
  const controlLabel = props.isActive ? "Pause" : "Play";

  const timeView =
    props.isActive && props.targetEndTime > props.startedAt ? (
      <Text
        timerInterval={{
          lower: new Date(props.startedAt),
          upper: new Date(props.targetEndTime),
        }}
        countsDown
        modifiers={[
          font({ weight: "bold", size: timeSize }),
          monospacedDigit(),
          foregroundStyle("#FFFFFF"),
          frame({ minWidth: isSmall ? 110 : 140, alignment: "center" }),
        ]}
      />
    ) : (
      <Text
        modifiers={[
          font({ weight: "bold", size: timeSize }),
          monospacedDigit(),
          foregroundStyle("#FFFFFF"),
        ]}
      >
        {formatMs(props.remainingMs)}
      </Text>
    );

  return (
    <VStack
      spacing={isSmall ? 8 : 12}
      alignment="center"
      modifiers={[
        containerBackground("#000000", "widget"),
        padding({ all: isSmall ? 14 : 18 }),
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
      ]}
    >
      {!isSmall ? (
        <Text
          modifiers={[
            font({ weight: "medium", size: 13 }),
            foregroundStyle("#FFFFFF99"),
          ]}
        >
          {props.label}
        </Text>
      ) : null}

      {timeView}

      <Spacer />

      <HStack spacing={8}>
        <Button
          label={controlLabel}
          target="toggle"
          onPress={toggle as unknown as () => void}
          modifiers={[
            buttonStyle("borderedProminent"),
            foregroundStyle("#000000"),
          ]}
        />
      </HStack>
    </VStack>
  );
};

export default createWidget("TimoWidget", TimoWidgetLayout);
