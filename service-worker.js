const CACHE_NAME = "tasktime-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png"
];

/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then((cache) => {

        return cache.addAll(FILES_TO_CACHE);

      })

      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()

      .then((cacheNames) => {

        return Promise.all(

          cacheNames

            .filter((name) => {

              return name !== CACHE_NAME;

            })

            .map((name) => {

              return caches.delete(name);

            })

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =========================================
   OFFLINE / CACHE
========================================= */

self.addEventListener("fetch", (event) => {

  event.respondWith(

    caches.match(event.request)

      .then((response) => {

        if (response) {

          return response;

        }

        return fetch(event.request);

      })

  );

});


/* =========================================
   FIREBASE CLOUD MESSAGING
   PUSH NOTIFICATION
========================================= */

self.addEventListener("push", (event) => {

  let data = {

    title: "TaskTime 🔔",

    body: "Kamu memiliki pengingat tugas.",

    icon: "./icon-192.png",

    badge: "./icon-192.png",

    url: "./"

  };


  /*

    Membaca data dari Firebase

  */

  if (event.data) {

    try {

      const pushData =
        event.data.json();


      data = {

        ...data,

        ...pushData

      };

    }

    catch (error) {

      data.body =
        event.data.text();

    }

  }


  const notificationOptions = {

    body:
      data.body,

    icon:
      data.icon ||
      "./icon-192.png",

    badge:
      data.badge ||
      "./icon-192.png",

    vibrate:
      [200, 100, 200],

    requireInteraction:
      false,

    data: {

      url:
        data.url ||
        "./"

    }

  };


  event.waitUntil(

    self.registration.showNotification(

      data.title,

      notificationOptions

    )

  );

});


/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener(
  "notificationclick",
  (event) => {

    event.notification.close();


    const urlToOpen =

      event.notification.data &&
      event.notification.data.url

        ? event.notification.data.url

        : "./";


    event.waitUntil(

      clients.matchAll({

        type:
          "window",

        includeUncontrolled:
          true

      })

      .then((clientList) => {


        /*

          Jika TaskTime sudah terbuka,
          fokuskan aplikasi.

        */

        for (
          const client of clientList
        ) {

          if (
            "focus" in client
          ) {

            return client.focus();

          }

        }


        /*

          Jika belum terbuka,
          buka TaskTime.

        */

        if (
          clients.openWindow
        ) {

          return clients.openWindow(
            urlToOpen
          );

        }

      })

    );

  }

);
