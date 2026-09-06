import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

function isNotificationsSupported(): boolean {
  return Platform.OS !== "web" && Constants.appOwnership !== "expo";
}

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!isNotificationsSupported()) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    const Notifications = await import("expo-notifications");

    if (!handlerConfigured) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    }

    notificationsModule = Notifications;
    return Notifications;
  } catch (error) {
    console.warn("Notifications unavailable", error);
    notificationsModule = null;
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  const settings = await Notifications.getPermissionsAsync();
  if (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function sendTimerFinishedNotification() {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timo",
        body: "Timer finished!",
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Notification error", error);
  }
}
