import { HStack, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";
import type { TimerSurfaceProps } from "./timerSurfaceTypes";

const TimoLiveActivityLayout = (
  props: TimerSurfaceProps,
  _environment: LiveActivityEnvironment,
) => {
  "widget";

  const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`);
  const formatMs = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(minutes)}:${pad2(seconds)}`;
  };

  const accent = "#FFFFFF";
  const muted = "#FFFFFF99";

  const Countdown = ({
    size,
    width,
  }: {
    size: number;
    width: number;
  }) =>
    props.isActive && props.targetEndTime > props.startedAt ? (
      <Text
        timerInterval={{
          lower: new Date(props.startedAt),
          upper: new Date(props.targetEndTime),
        }}
        countsDown
        modifiers={[
          font({ weight: "bold", size }),
          monospacedDigit(),
          foregroundStyle(accent),
          frame({ width, alignment: "trailing" }),
        ]}
      />
    ) : (
      <Text
        modifiers={[
          font({ weight: "bold", size }),
          monospacedDigit(),
          foregroundStyle(accent),
          frame({ width, alignment: "trailing" }),
        ]}
      >
        {formatMs(props.remainingMs)}
      </Text>
    );

  return {
    banner: (
      <VStack
        alignment="leading"
        spacing={8}
        modifiers={[
          containerBackground("#000000", "widget"),
          padding({ all: 16 }),
          frame({ maxWidth: Infinity, alignment: "leading" }),
        ]}
      >
        <HStack spacing={8}>
          <Image systemName="timer" size={14} color={accent} />
          <Text
            modifiers={[
              font({ weight: "medium", size: 13 }),
              foregroundStyle(muted),
            ]}
          >
            Timo
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ weight: "medium", size: 13 }),
              foregroundStyle(muted),
            ]}
          >
            {props.label}
          </Text>
        </HStack>
        <HStack>
          <Text
            modifiers={[
              font({ weight: "bold", size: 28 }),
              foregroundStyle(accent),
            ]}
          >
            Focus
          </Text>
          <Spacer />
          <Countdown size={28} width={110} />
        </HStack>
      </VStack>
    ),
    compactLeading: (
      <Image
        systemName="timer"
        size={14}
        color={accent}
        modifiers={[padding({ leading: 4 })]}
      />
    ),
    compactTrailing: <Countdown size={14} width={52} />,
    minimal: <Image systemName="timer" size={16} color={accent} />,
    expandedLeading: (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[padding({ all: 8 })]}
      >
        <Image systemName="timer" size={18} color={accent} />
        <Text
          modifiers={[
            font({ weight: "medium", size: 12 }),
            foregroundStyle(muted),
          ]}
        >
          Timo
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack
        alignment="trailing"
        spacing={2}
        modifiers={[padding({ all: 8 })]}
      >
        <Countdown size={20} width={72} />
        <Text
          modifiers={[
            font({ weight: "medium", size: 12 }),
            foregroundStyle(muted),
          ]}
        >
          {props.label}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <HStack modifiers={[padding({ horizontal: 12, bottom: 10 })]}>
        <Text
          modifiers={[
            font({ weight: "medium", size: 13 }),
            foregroundStyle(muted),
          ]}
        >
          Stay with the timer
        </Text>
        <Spacer />
      </HStack>
    ),
  };
};

export default createLiveActivity("TimoLiveActivity", TimoLiveActivityLayout);
