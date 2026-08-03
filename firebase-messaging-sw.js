/* =========================================
   TASKTIME - FIREBASE MESSAGING SERVICE WORKER
   ========================================= */

/*
 * Firebase Messaging Service Worker
 *
 * File ini harus berada di root aplikasi:
 *
 * /index.html
 * /script.js
 * /style.css
 * /manifest.json
 * /service-worker.js
 * /firebase-messaging-sw.js
 *
 */


/* =========================================
   IMPORT FIREBASE COMPAT SDK
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

const firebaseConfig = {

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

};


/* =========================================
   INITIALIZE FIREBASE
   ========================================= */

firebase.initializeApp(
    firebaseConfig
);


/* =========================================
   INITIALIZE FIREBASE MESSAGING
   ========================================= */

const messaging =
    firebase.messaging();


/* =========================================
   BACKGROUND NOTIFICATION
   ========================================= */

messaging.onBackgroundMessage(
    function (payload) {

        console.log(
            "[firebase-messaging-sw.js] " +
            "Pesan background diterima:",
            payload
        );


        /*
         * Ambil data notifikasi
         */

        const notification =
            payload.notification || {};


        const data =
            payload.data || {};


        /*
         * Judul notifikasi
         */

        const title =
            notification.title ||
            data.title ||
            "TaskTime ⏰";


        /*
         * Isi notifikasi
         */

        const body =
            notification.body ||
            data.body ||
            "Kamu memiliki pengingat tugas.";


        /*
         * Icon notifikasi
         *
         * Jika kamu belum punya icon.png,
         * bagian icon bisa dihapus.
         */

        const icon =
            notification.icon ||
            data.icon ||
            "./icon-192.png";


        /*
         * Badge Android
         */

        const badge =
            notification.badge ||
            data.badge ||
            "./icon-192.png";


        /*
         * URL ketika notifikasi diklik
         */

        const clickAction =
            notification.click_action ||
            data.click_action ||
            "./index.html";


        /*
         * Opsi notifikasi
         */

        const notificationOptions = {

            body:
                body,

            icon:
                icon,

            badge:
                badge,

            tag:
                data.taskId
                ? `tasktime-${data.taskId}`
                : "tasktime-notification",

            renotify:
                true,

            requireInteraction:
                false,

            data: {

                taskId:
                    data.taskId ||
                    "",

                url:
                    clickAction

            }

        };


        /*
         * Tampilkan notifikasi
         */

        return self.registration.showNotification(

            title,

            notificationOptions

        );

    }

);


/* =========================================
   NOTIFICATION CLICK
   ========================================= */

self.addEventListener(
    "notificationclick",
    function (event) {

        console.log(
            "[firebase-messaging-sw.js] " +
            "Notifikasi diklik."
        );


        /*
         * Tutup notifikasi
         */

        event.notification.close();


        /*
         * Ambil URL tujuan
         */

        const notificationData =
            event.notification.data ||
            {};


        const targetUrl =
            notificationData.url ||
            "./index.html";


        /*
         * Buka atau fokus aplikasi TaskTime
         */

        event.waitUntil(

            clients.matchAll({

                type:
                    "window",

                includeUncontrolled:
                    true

            })

            .then(
                function (clientList) {

                    /*
                     * Cari tab TaskTime yang sudah terbuka
                     */

                    for (
                        const client
                        of clientList
                    ) {

                        if (
                            client.url.includes(
                                "index.html"
                            ) &&
                            "focus" in client
                        ) {

                            return client.focus();

                        }

                    }


                    /*
                     * Jika belum ada,
                     * buka TaskTime
                     */

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
   SERVICE WORKER INSTALL
   ========================================= */

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "[firebase-messaging-sw.js] " +
            "Service Worker di-install."
        );


        /*
         * Langsung aktif tanpa menunggu
         */

        self.skipWaiting();

    }

);


/* =========================================
   SERVICE WORKER ACTIVATE
   ========================================= */

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "[firebase-messaging-sw.js] " +
            "Service Worker aktif."
        );


        /*
         * Ambil kontrol semua halaman
         */

        event.waitUntil(
            self.clients.claim()
        );

    }

);


/* =========================================
   MESSAGE DARI APLIKASI UTAMA
   ========================================= */

self.addEventListener(
    "message",
    function (event) {

        console.log(
            "[firebase-messaging-sw.js] " +
            "Pesan dari aplikasi utama:",
            event.data
        );

    }

);


/* =========================================
   END OF FIREBASE MESSAGING SERVICE WORKER
   ========================================= */
