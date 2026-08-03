/* =========================================
   TASKTIME — FIREBASE MESSAGING SERVICE WORKER
   ========================================= */

importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js"
);


/* =========================================
   FIREBASE CONFIG
   ========================================= */

firebase.initializeApp({

  apiKey:
    "AIzaSyCQuYr2-qUXwpL1ZI8cFOvAKMlbmgjX2d4",

  authDomain:
    "tasktime-e94d0.firebaseapp.com",

  projectId:
    "tasktime-e94d0",

  storageBucket:
    "tasktime-e94d0.firebasestorage.app",

  messagingSenderId:
    "32849434537",

  appId:
    "1:32849434537:web:5ac043cb375ffef93c96b8"

});


/* =========================================
   FIREBASE MESSAGING
   ========================================= */

const messaging =
  firebase.messaging();


/* =========================================
   BACKGROUND NOTIFICATION
   ========================================= */

messaging.onBackgroundMessage(
  function (payload) {

    console.log(
      "[firebase-messaging-sw.js] Pesan diterima:",
      payload
    );


    const notification =
      payload.notification || {};


    const title =
      notification.title ||
      "TaskTime 🔔";


    const options = {

      body:
        notification.body ||
        "Kamu memiliki pengingat tugas.",

      icon:
        "./icon-192.png",

      badge:
        "./icon-192.png",

      tag:
        "tasktime-notification",

      renotify:
        true,

      data:
        payload.data || {

          url:
            "./index.html"

        }

    };


    self.registration.showNotification(
      title,
      options
    );

  }
);


/* =========================================
   KETIKA NOTIFIKASI DIKLIK
   ========================================= */

self.addEventListener(
  "notificationclick",
  function (event) {

    console.log(
      "[TaskTime] Notifikasi diklik."
    );


    event.notification.close();


    const notificationData =
      event.notification.data || {};


    const targetUrl =
      notificationData.url ||
      "./index.html";


    event.waitUntil(

      clients.matchAll({

        type:
          "window",

        includeUncontrolled:
          true

      })

      .then(
        function (clientList) {

          /* =================================
             CARI TAB TASKTIME YANG SUDAH BUKA
          ================================= */

          for (
            const client of clientList
          ) {

            if (
              "focus" in client
            ) {

              return client.focus();

            }

          }


          /* =================================
             BUKA TASKTIME JIKA BELUM TERBUKA
          ================================= */

          if (
            clients.openWindow
          ) {

            return clients.openWindow(
              targetUrl
            );

          }

        }

      )

    );

  }
);


/* =========================================
   SERVICE WORKER AKTIF
   ========================================= */

self.addEventListener(
  "activate",
  function (event) {

    console.log(
      "[TaskTime] Firebase Messaging Service Worker aktif."
    );

    event.waitUntil(
      self.clients.claim()
    );

  }
);
