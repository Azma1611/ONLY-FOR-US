importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// Note: Normally you'd want to inject the config here via a bundler or hardcode just what's needed.
const firebaseConfig = {
  apiKey: "AIzaSyMockKeyForDev-Phase10OnlyForUs",
  authDomain: "onlyforus-app.firebaseapp.com",
  projectId: "onlyforus-app",
  storageBucket: "onlyforus-app.appspot.com",
  messagingSenderId: "123456789012", // Replace with actual sender ID
  appId: "1:123456789012:web:mock123456789"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
