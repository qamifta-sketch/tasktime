 /* =========================================
   TASKTIME - SERVICE WORKER
   PWA + OFFLINE + PUSH NOTIFICATION
========================================= */


/* =========================================
   CACHE
========================================= */

const CACHE_NAME = "tasktime-v2";


const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];



/* =========================================
   INSTALL
========================================= */

self.addEventListener(
  "install",
  function (event) {

    console.log(
      "TaskTime Service Worker: Install"
    );


    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(
          function (cache) {

            return cache.addAll(
              FILES_TO_CACHE
            );

          }
        )

        .then(
          function () {

            return self.skipWaiting();

          }
        )

    );

  }
);



/* =========================================
   ACTIVATE
========================================= */

self.addEventListener(
  "activate",
  function (event) {

    console.log(
      "TaskTime Service Worker: Aktif"
    );


    event.waitUntil(

      caches
        .keys()

        .then(
          function (cacheNames) {

            return Promise.all(

              cacheNames

                .filter(
                  function (name) {

                    return (
                      name !== CACHE_NAME
                    );

                  }
                )

                .map(
                  function (name) {

                    return caches.delete(
                      name
                    );

                  }
                )

            );

          }
        )

        .then(
          function () {

            return self.clients.claim();

          }
        )

    );

  }
);



/* =========================================
   FETCH / OFFLINE
========================================= */

self.addEventListener(
  "fetch",
  function (event) {

    event.respondWith(

      caches
        .match(event.request)

        .then(
          function (cachedResponse) {

            if (cachedResponse) {

              return cachedResponse;

            }


            return fetch(
              event.request
            )

            .then(
              function (networkResponse) {

                return networkResponse;

              }
            )

            .catch(
              function () {

                return caches.match(
                  "./index.html"
                );

              }
            );

          }
        )

    );

  }
);



/* =========================================
   PUSH NOTIFICATION
========================================= */

self.addEventListener(
  "push",
  function (event) {

    let notificationData = {

      title:
        "TaskTime 🔔",

      body:
        "Kamu memiliki pengingat tugas.",

      icon:
        "./icon-192.png",

      badge:
        "./icon-192.png",

      url:
        "./"

    };



    /* Jika ada data dari Push Server */

    if (event.data) {

      try {

        const receivedData =
          event.data.json();


        notificationData = {

          ...notificationData,

          ...receivedData

        };

      }

      catch (error) {

        notificationData.body =
          event.data.text();

      }

    }



    /* Tampilkan notifikasi */

    event.waitUntil(

      self.registration.showNotification(

        notificationData.title,

        {

          body:
            notificationData.body,

          icon:
            notificationData.icon,

          badge:
            notificationData.badge,

          vibrate:
            [200, 100, 200],

          tag:
            "tasktime-notification",

          renotify:
            true,

          data: {

            url:
              notificationData.url ||
              "./"

          }

        }

      )

    );

  }
);



/* =========================================
   NOTIFICATION CLICK
========================================= */

self.addEventListener(
  "notificationclick",
  function (event) {

    event.notification.close();


    const targetUrl =
      event.notification.data &&
      event.notification.data.url

        ? event.notification.data.url

        : "./";



    event.waitUntil(

      clients
        .matchAll({

          type:
            "window",

          includeUncontrolled:
            true

        })

        .then(
          function (clientList) {


            /* Cari TaskTime yang sudah terbuka */

            for (
              const client
              of clientList
            ) {

              if (
                client.url.includes(
                  "github.io"
                ) &&
                "focus" in client
              ) {

                return client.focus();

              }

            }



            /* Kalau belum terbuka,
               buka TaskTime */

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
   MESSAGE
   Komunikasi dengan script.js
========================================= */

self.addEventListener(
  "message",
  function (event) {

    if (
      event.data &&
      event.data.type ===
      "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }

  }
);



/* =========================================
   END SERVICE WORKER
========================================= */

console.log(
  "TaskTime Service Worker siap."
);
