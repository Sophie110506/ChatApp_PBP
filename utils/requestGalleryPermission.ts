import { PermissionsAndroid } from "react-native";

export async function requestGalleryPermission() {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    {
      title: "Gallery Permission",
      message: "Aplikasi perlu akses galeri",
      buttonPositive: "OK"
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}
