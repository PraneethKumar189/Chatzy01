import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config/firebase";

export const uploadImageAsync = async (uri) => {
  // Convert the URI to a blob
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.error('Network request failed:', e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  // Create a reference to the file location in Firebase Storage
  const fileRef = ref(storage, `images/${new Date().getTime()}.jpg`); // Adjust path as needed
  await uploadBytes(fileRef, blob);

  // We're done with the blob, close and release it
  blob.close();

  // Get the download URL
  return await getDownloadURL(fileRef);
};
