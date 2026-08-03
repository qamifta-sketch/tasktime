/* =========================================================
   TASKTIME — SCRIPT.JS FINAL
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL DATA
   ========================================================= */

let tasks = JSON.parse(localStorage.getItem("taskTimeTasks")) || [];

let notifications =
  JSON.parse(localStorage.getItem("taskTimeNotifications")) || [];

let userProfile =
  JSON.parse(localStorage.getItem("taskTimeProfile")) || {
    name: "",
    photo: ""
  };

let currentFilter = "all";
let currentSearch = "";
let selectedTaskId = null;

let currentCalendarDate = new Date();
let selectedCalendarDate = new Date();

let deferredInstallPrompt = null;


/* =========================================================
   DOM HELPER
   ========================================================= */

const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   STORAGE
   ========================================================= */

function saveTasks() {
  localStorage.setItem(
    "taskTimeTasks",
    JSON.stringify(tasks)
  );
}

function saveNotifications() {
  localStorage.setItem(
    "taskTimeNotifications",
    JSON.stringify(notifications)
  );
}

function saveProfile() {
  localStorage.setItem(
    "taskTimeProfile",
    JSON.stringify(userProfile)
  );
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout = null;

window.showToast = function(icon = "✓", message = "Berhasil") {

  const toast = $("toast");
  const toastIcon = $("toastIcon");
  const toastMessage = $("toastMessage");

  if (!toast) return;

  if (toastIcon) {
    toastIcon.textContent = icon;
  }

  if (toastMessage) {
    toastMessage.textContent = message;
  }

  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
};


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getLocalDateString(date = new Date()) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

  if (!dateString) return "-";

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );
}


function formatShortDate(dateString) {

  if (!dateString) return "-";

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "short"
    }
  );
}


function getGreeting() {

  const hour =
    new Date().getHours();

  if (hour < 11) {
    return "Selamat pagi 👋";
  }

  if (hour < 15) {
    return "Selamat siang 👋";
  }

  if (hour < 18) {
    return "Selamat sore 👋";
  }

  return "Selamat malam 👋";
}


/* =========================================================
   PROFILE
   ========================================================= */

function updateProfileUI() {

  const name =
    userProfile.name ||
    "Pengguna TaskTime";

  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  const profileInitial =
    $("profileInitial");

  const largeProfileInitial =
    $("largeProfileInitial");

  const profileNameDisplay =
    $("profileNameDisplay");

  const profileEmailDisplay =
    $("profileEmailDisplay");

  const userName =
    $("userName");

  if (profileInitial) {

    if (userProfile.photo) {

      profileInitial.innerHTML = `
        <img
          src="${userProfile.photo}"
          alt="Foto Profil"
        >
      `;

    } else {

      profileInitial.textContent =
        initial;

    }

  }


  if (largeProfileInitial) {

    if (userProfile.photo) {

      largeProfileInitial.innerHTML = `
        <img
          src="${userProfile.photo}"
          alt="Foto Profil"
        >
      `;

    } else {

      largeProfileInitial.textContent =
        initial;

    }

  }


  if (profileNameDisplay) {

    profileNameDisplay.textContent =
      name;

  }


  if (profileEmailDisplay) {

    profileEmailDisplay.textContent =
      userProfile.name
        ? "Selamat datang kembali di TaskTime"
        : "Selamat datang di TaskTime";

  }


  if (userName) {

    userName.value =
      userProfile.name || "";

  }

}


function saveUserProfile() {

  const input =
    $("userName");

  if (!input) return;

  const name =
    input.value.trim();

  userProfile.name =
    name;

  saveProfile();

  updateProfileUI();

  showToast(
    "✓",
    "Profil berhasil disimpan"
  );

}


/* =========================================================
   PROFILE PHOTO UPLOAD
   ========================================================= */

function createProfileUpload() {

  const avatar =
    document.querySelector(
      ".large-profile-avatar"
    );

  if (!avatar) return;

  if (
    document.getElementById(
      "profilePhotoInput"
    )
  ) return;

  const input =
    document.createElement("input");

  input.type = "file";

  input.id =
    "profilePhotoInput";

  input.accept =
    "image/*";

  input.style.display =
    "none";

  document.body.appendChild(input);


  avatar.style.cursor =
    "pointer";

  avatar.title =
    "Klik untuk mengubah foto profil";


  avatar.addEventListener(
    "click",
    () => {

      input.click();

    }
  );


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showToast(
          "⚠️",
          "File harus berupa gambar"
        );

        return;

      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        showToast(
          "⚠️",
          "Ukuran foto maksimal 5 MB"
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          userProfile.photo =
            event.target.result;

          saveProfile();

          updateProfileUI();

          showToast(
            "📸",
            "Foto profil berhasil diubah"
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   TASK ID
   ========================================================= */

function generateTaskId() {

  return (
    Date.now().toString() +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}


/* =========================================================
   TASK CATEGORY
   ========================================================= */

function getCategoryName(category) {

  const categories = {

    sekolah: "🏫 Sekolah",

    kuliah: "🎓 Kuliah",

    kerja: "💼 Kerja",

    pribadi: "👤 Pribadi",

    lainnya: "📌 Lainnya"

  };

  return (
    categories[category] ||
    "📌 Lainnya"
  );

}


/* =========================================================
   PRIORITY
   ========================================================= */

function getPriorityName(priority) {

  const priorities = {

    low: "Rendah",

    medium: "Sedang",

    high: "Tinggi"

  };

  return (
    priorities[priority] ||
    "Rendah"
  );

}


/* =========================================================
   CREATE TASK CARD
   ========================================================= */

function createTaskCard(task) {

  const card =
    document.createElement("div");

  card.className =
    "task-card" +
    (
      task.completed
        ? " completed"
        : ""
    );

  card.dataset.taskId =
    task.id;


  const priorityClass =
    `priority-${task.priority || "low"}`;


  card.innerHTML = `

    <div class="task-check">

      <button
        class="check-button"
        data-action="complete"
        data-id="${task.id}"
        type="button"
        aria-label="Tandai tugas selesai"
      >
        ${task.completed ? "✓" : ""}
      </button>

    </div>


    <div
      class="task-content"
      data-action="open"
      data-id="${task.id}"
    >

      <h3>
        ${escapeHTML(task.title)}
      </h3>

      ${
        task.description
          ? `
            <p>
              ${escapeHTML(
                task.description
              )}
            </p>
          `
          : ""
      }


      <div class="task-meta">

        <span>
          📅 ${formatShortDate(
            task.date
          )}
        </span>

        ${
          task.time
            ? `
              <span>
                ⏰ ${task.time}
              </span>
            `
            : ""
        }

      </div>


      <div class="task-tags">

        <span class="task-category">
          ${getCategoryName(
            task.category
          )}
        </span>

        <span
          class="task-priority ${priorityClass}"
        >
          🔥 ${getPriorityName(
            task.priority
          )}
        </span>

      </div>

    </div>


    <button
      class="task-more-button"
      data-action="open"
      data-id="${task.id}"
      type="button"
      aria-label="Detail tugas"
    >
      ⋮
    </button>

  `;


  return card;

}


/* =========================================================
   FILTER TASKS
   ========================================================= */

function getFilteredTasks() {

  let result = [
    ...tasks
  ];


  if (
    currentFilter ===
    "pending"
  ) {

    result =
      result.filter(
        task =>
          !task.completed
      );

  }


  if (
    currentFilter ===
    "completed"
  ) {

    result =
      result.filter(
        task =>
          task.completed
      );

  }


  if (
    currentFilter ===
    "priority"
  ) {

    result =
      result.filter(
        task =>
          task.priority ===
          "high" &&
          !task.completed
      );

  }


  if (currentSearch) {

    const search =
      currentSearch.toLowerCase();


    result =
      result.filter(
        task =>

          task.title
            .toLowerCase()
            .includes(search)

          ||

          (
            task.description ||
            ""
          )
            .toLowerCase()
            .includes(search)

          ||

          (
            task.category ||
            ""
          )
            .toLowerCase()
            .includes(search)

      );

  }


  result.sort(
    (a, b) => {

      const dateA =
        `${a.date} ${a.time || "23:59"}`;

      const dateB =
        `${b.date} ${b.time || "23:59"}`;

      return dateA.localeCompare(
        dateB
      );

    }
  );


  return result;

}


/* =========================================================
   RENDER ALL TASKS
   ========================================================= */

function renderAllTasks() {

  const container =
    $("allTaskList");

  if (!container) return;


  container.innerHTML = "";


  const filtered =
    getFilteredTasks();


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📋
        </div>

        <h3>
          ${
            currentSearch
              ? "Tugas tidak ditemukan"
              : "Belum ada tugas"
          }
        </h3>

        <p>
          ${
            currentSearch
              ? "Coba gunakan kata pencarian lain."
              : "Semua tugasmu akan muncul di sini."
          }
        </p>

      </div>

    `;

    return;

  }


  filtered.forEach(
    task => {

      container.appendChild(
        createTaskCard(task)
      );

    }
  );

}


/* =========================================================
   RENDER TODAY TASKS
   ========================================================= */

function renderTodayTasks() {

  const container =
    $("todayTaskList");

  if (!container) return;


  container.innerHTML = "";


  const today =
    getLocalDateString();


  const todayTasks =
    tasks
      .filter(
        task =>
          task.date ===
          today
      )
      .sort(
        (a, b) =>
          (
            a.time || "23:59"
          ).localeCompare(
            b.time || "23:59"
          )
      );


  if (
    todayTasks.length === 0
  ) {

    container.innerHTML = `

      <div
        id="emptyTodayState"
        class="empty-state"
      >

        <div class="empty-icon">
          📝
        </div>

        <h3>
          Belum ada tugas
        </h3>

        <p>
          Tambahkan tugas pertamamu untuk hari ini.
        </p>

        <button
          id="emptyAddTaskButton"
          class="primary-button"
          type="button"
        >
          + Tambah Tugas
        </button>

      </div>

    `;

    const button =
      $("emptyAddTaskButton");

    if (button) {

      button.addEventListener(
        "click",
        () =>
          navigateTo("add")
      );

    }

    return;

  }


  todayTasks.forEach(
    task => {

      container.appendChild(
        createTaskCard(task)
      );

    }
  );

}


/* =========================================================
   RENDER UPCOMING TASKS
   ========================================================= */

function renderUpcomingTasks() {

  const container =
    $("upcomingTaskList");

  if (!container) return;


  container.innerHTML = "";


  const today =
    getLocalDateString();


  const upcoming =
    tasks
      .filter(
        task =>
          task.date >
          today &&
          !task.completed
      )
      .sort(
        (a, b) =>
          `${a.date} ${a.time || ""}`
            .localeCompare(
              `${b.date} ${b.time || ""}`
            )
      )
      .slice(0, 5);


  if (
    upcoming.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          🗓️
        </div>

        <h3>
          Tidak ada tugas mendatang
        </h3>

        <p>
          Jadwal tugas berikutnya akan muncul di sini.
        </p>

      </div>

    `;

    return;

  }


  upcoming.forEach(
    task => {

      container.appendChild(
        createTaskCard(task)
      );

    }
  );

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      task =>
        task.completed
    ).length;

  const pending =
    total -
    completed;

  const priority =
    tasks.filter(
      task =>
        task.priority ===
        "high" &&
        !task.completed
    ).length;


  if ($("totalTaskCount")) {

    $("totalTaskCount")
      .textContent =
      total;

  }


  if ($("pendingTaskCount")) {

    $("pendingTaskCount")
      .textContent =
      pending;

  }


  if ($("completedTaskCount")) {

    $("completedTaskCount")
      .textContent =
      completed;

  }


  if ($("priorityTaskCount")) {

    $("priorityTaskCount")
      .textContent =
      priority;

  }

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

  renderTodayTasks();

  renderUpcomingTasks();

  renderAllTasks();

  updateStatistics();

  renderCalendar();

  renderSelectedDateTasks();

  updateNotificationBadge();

  renderNotifications();

}


/* =========================================================
   ADD TASK
   ========================================================= */

function handleTaskSubmit(event) {

  event.preventDefault();


  const title =
    $("taskTitle")
      ?.value
      .trim();


  const description =
    $("taskDescription")
      ?.value
      .trim() ||
    "";


  const date =
    $("taskDate")
      ?.value;


  const time =
    $("taskTime")
      ?.value ||
    "";


  const category =
    $("taskCategory")
      ?.value ||
    "sekolah";


  const priority =
    document.querySelector(
      'input[name="taskPriority"]:checked'
    )?.value ||
    "low";


  const reminder =
    $("taskReminder")
      ?.checked ||
    false;


  if (
    !title ||
    !date
  ) {

    showToast(
      "⚠️",
      "Nama tugas dan tanggal wajib diisi"
    );

    return;

  }


  const task = {

    id:
      generateTaskId(),

    title,

    description,

    date,

    time,

    category,

    priority,

    reminder,

    completed:
      false,

    createdAt:
      new Date().toISOString()

  };


  tasks.push(
    task
  );


  saveTasks();


  if (reminder) {

    addNotification(
      "🔔",
      "Pengingat tugas diaktifkan",
      `${title} — ${formatDate(date)}${time ? ` pukul ${time}` : ""}`
    );

  }


  event.target.reset();


  setDefaultTaskDate();


  renderAll();


  showToast(
    "✓",
    "Tugas berhasil ditambahkan"
  );


  navigateTo("home");

}


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultTaskDate() {

  const dateInput =
    $("taskDate");

  if (!dateInput) return;


  if (!dateInput.value) {

    dateInput.value =
      getLocalDateString();

  }

}


/* =========================================================
   COMPLETE TASK
   ========================================================= */

function toggleTaskComplete(id) {

  const task =
    tasks.find(
      item =>
        item.id === id
    );


  if (!task) return;


  task.completed =
    !task.completed;


  saveTasks();

  renderAll();


  showToast(
    task.completed
      ? "✅"
      : "↩️",
    task.completed
      ? "Tugas selesai!"
      : "Tugas dikembalikan"
  );

}


/* =========================================================
   OPEN TASK MODAL
   ========================================================= */

function openTaskModal(id) {

  const task =
    tasks.find(
      item =>
        item.id === id
    );


  if (!task) return;


  selectedTaskId =
    id;


  const modal =
    $("taskModal");

  const content =
    $("taskModalContent");


  if (!modal || !content) return;


  content.innerHTML = `

    <div class="task-detail">

      <h3>
        ${escapeHTML(
          task.title
        )}
      </h3>

      ${
        task.description
          ? `
            <p style="margin-top:10px;">
              ${escapeHTML(
                task.description
              )}
            </p>
          `
          : ""
      }


      <div
        class="task-meta"
        style="margin-top:15px;"
      >

        <span>
          📅 ${formatDate(
            task.date
          )}
        </span>

        ${
          task.time
            ? `
              <span>
                ⏰ ${task.time}
              </span>
            `
            : ""
        }

      </div>


      <div class="task-tags">

        <span class="task-category">
          ${getCategoryName(
            task.category
          )}
        </span>

        <span
          class="
            task-priority
            priority-${task.priority}
          "
        >
          🔥 ${getPriorityName(
            task.priority
          )}
        </span>

        ${
          task.completed
            ? `
              <span class="task-category">
                ✅ Selesai
              </span>
            `
            : ""
        }

      </div>

    </div>

  `;


  const completeButton =
    $("completeTaskButton");


  if (completeButton) {

    completeButton.textContent =
      task.completed
        ? "↩️ Belum Selesai"
        : "✓ Tandai Selesai";

  }


  modal.classList.remove(
    "hidden"
  );

}


/* =========================================================
   CLOSE TASK MODAL
   ========================================================= */

function closeTaskModal() {

  const modal =
    $("taskModal");

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

  selectedTaskId =
    null;

}


/* =========================================================
   DELETE TASK
   ========================================================= */

function deleteSelectedTask() {

  if (!selectedTaskId) return;


  const task =
    tasks.find(
      item =>
        item.id ===
        selectedTaskId
    );


  if (!task) return;


  const confirmed =
    confirm(
      `Hapus tugas "${task.title}"?`
    );


  if (!confirmed) return;


  tasks =
    tasks.filter(
      item =>
        item.id !==
        selectedTaskId
    );


  saveTasks();

  closeTaskModal();

  renderAll();


  showToast(
    "🗑️",
    "Tugas berhasil dihapus"
  );

}


/* =========================================================
   EDIT TASK
   ========================================================= */

function editSelectedTask() {

  if (!selectedTaskId) return;


  const task =
    tasks.find(
      item =>
        item.id ===
        selectedTaskId
    );


  if (!task) return;


  $("taskTitle").value =
    task.title;

  $("taskDescription").value =
    task.description || "";

  $("taskDate").value =
    task.date;

  $("taskTime").value =
    task.time || "";

  $("taskCategory").value =
    task.category || "sekolah";


  const priorityRadio =
    document.querySelector(
      `input[name="taskPriority"][value="${task.priority}"]`
    );


  if (priorityRadio) {

    priorityRadio.checked =
      true;

  }


  if ($("taskReminder")) {

    $("taskReminder").checked =
      task.reminder || false;

  }


  tasks =
    tasks.filter(
      item =>
        item.id !==
        selectedTaskId
    );


  saveTasks();

  closeTaskModal();

  navigateTo("add");


  showToast(
    "✏️",
    "Edit tugas lalu simpan kembali"
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigateTo(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(
      page => {

        page.classList.toggle(
          "active",
          page.dataset.page ===
          pageName
        );

      }
    );


  document
    .querySelectorAll(".nav-item")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
          pageName
        );

      }
    );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (
    pageName ===
    "calendar"
  ) {

    renderCalendar();

  }

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar() {

  const container =
    $("calendarDays");

  const title =
    $("calendarMonth");


  if (!container || !title) return;


  const year =
    currentCalendarDate
      .getFullYear();


  const month =
    currentCalendarDate
      .getMonth();


  title.textContent =
    new Date(
      year,
      month,
      1
    ).toLocaleDateString(
      "id-ID",
      {
        month: "long",
        year: "numeric"
      }
    );


  container.innerHTML = "";


  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );

    container.appendChild(
      empty
    );

  }


  const today =
    getLocalDateString();


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const date =
      new Date(
        year,
        month,
        day
      );


    const dateString =
      getLocalDateString(
        date
      );


    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";

    button.className =
      "calendar-day";


    if (
      dateString ===
      today
    ) {

      button.classList.add(
        "today"
      );

    }


    if (
      dateString ===
      getLocalDateString(
        selectedCalendarDate
      )
    ) {

      button.classList.add(
        "selected"
      );

    }


    const hasTask =
      tasks.some(
        task =>
          task.date ===
          dateString
      );


    if (hasTask) {

      button.classList.add(
        "has-task"
      );

    }


    button.textContent =
      day;


    button.addEventListener(
      "click",
      () => {

        selectedCalendarDate =
          date;

        renderCalendar();

        renderSelectedDateTasks();

      }
    );


    container.appendChild(
      button
    );

  }

}


/* =========================================================
   SELECTED DATE TASKS
   ========================================================= */

function renderSelectedDateTasks() {

  const container =
    $("selectedDateTaskList");

  const title =
    $("selectedDateTitle");


  if (!container) return;


  const dateString =
    getLocalDateString(
      selectedCalendarDate
    );


  if (title) {

    title.textContent =
      `Jadwal ${formatDate(
        dateString
      )}`;

  }


  container.innerHTML = "";


  const selectedTasks =
    tasks.filter(
      task =>
        task.date ===
        dateString
    );


  if (
    selectedTasks.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📅
        </div>

        <h3>
          Tidak ada tugas
        </h3>

        <p>
          Tidak ada tugas pada tanggal ini.
        </p>

      </div>

    `;

    return;

  }


  selectedTasks.forEach(
    task => {

      container.appendChild(
        createTaskCard(task)
      );

    }
  );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function addNotification(
  icon,
  title,
  message
) {

  notifications.unshift({

    id:
      Date.now().toString(),

    icon,

    title,

    message,

    date:
      getLocalDateString(),

    time:
      new Date()
        .toTimeString()
        .slice(0, 5),

    read:
      false

  });


  notifications =
    notifications.slice(
      0,
      50
    );


  saveNotifications();

  updateNotificationBadge();

  renderNotifications();

}


/* =========================================================
   NOTIFICATION BADGE
   ========================================================= */

function updateNotificationBadge() {

  const badge =
    $("notificationBadge");

  if (!badge) return;


  const unread =
    notifications.filter(
      notification =>
        !notification.read
    ).length;


  badge.textContent =
    unread > 99
      ? "99+"
      : unread;


  badge.style.display =
    unread > 0
      ? "flex"
      : "none";

}


/* =========================================================
   RENDER NOTIFICATIONS
   ========================================================= */

function renderNotifications() {

  const container =
    $("notificationList");

  if (!container) return;


  if (
    notifications.length ===
    0
  ) {

    container.innerHTML = `

      <div class="empty-notification">

        <span>
          🔔
        </span>

        <p>
          Belum ada notifikasi.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    notifications
      .map(
        notification => `

          <div class="notification-item">

            <span>
              ${
                notification.icon ||
                "🔔"
              }
            </span>

            <div>

              <strong>
                ${escapeHTML(
                  notification.title
                )}
              </strong>

              <small>
                ${escapeHTML(
                  notification.message ||
                  ""
                )}
              </small>

              <small>
                ${
                  notification.date
                    ? formatDate(
                        notification.date
                      )
                    : ""
                }
                ${
                  notification.time
                    ? ` • ${notification.time}`
                    : ""
                }
              </small>

            </div>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   MARK NOTIFICATIONS READ
   ========================================================= */

function markNotificationsRead() {

  notifications =
    notifications.map(
      notification => ({
        ...notification,
        read: true
      })
    );


  saveNotifications();

  updateNotificationBadge();

}


/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */

function toggleNotificationPanel() {

  const panel =
    $("notificationPanel");

  if (!panel) return;


  panel.classList.toggle(
    "hidden"
  );


  if (
    !panel.classList.contains(
      "hidden"
    )
  ) {

    markNotificationsRead();

  }

}


/* =========================================================
   REQUEST NOTIFICATION PERMISSION
   ========================================================= */

async function enableNotifications() {

  if (
    !("Notification" in window)
  ) {

    showToast(
      "⚠️",
      "Browser tidak mendukung notifikasi"
    );

    return;

  }


  try {

    const permission =
      await Notification.requestPermission();


    if (
      permission !==
      "granted"
    ) {

      showToast(
        "⚠️",
        "Izin notifikasi belum diberikan"
      );

      return;

    }


    showToast(
      "🔔",
      "Notifikasi berhasil diaktifkan"
    );


    await getFirebaseToken();

  } catch (error) {

    console.error(
      error
    );

    showToast(
      "⚠️",
      "Gagal mengaktifkan notifikasi"
    );

  }

}


/* =========================================================
   FIREBASE FCM TOKEN
   ========================================================= */

async function getFirebaseToken() {

  const firebase =
    window.taskTimeFirebase;


  if (!firebase) {

    console.warn(
      "Firebase belum tersedia"
    );

    return null;

  }


  try {

    const registration =
      await navigator.serviceWorker.ready;


    const token =
      await firebase.getToken(
        firebase.messaging,
        {
          vapidKey:
            firebase.VAPID_KEY,

          serviceWorkerRegistration:
            registration
        }
      );


    if (token) {

      console.log(
        "FCM Token:",
        token
      );


      localStorage.setItem(
        "taskTimeFCMToken",
        token
      );


      return token;

    }


    console.warn(
      "FCM Token tidak tersedia"
    );


  } catch (error) {

    console.error(
      "Gagal mendapatkan FCM token:",
      error
    );

  }


  return null;

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function exportData() {

  const data = {

    app:
      "TaskTime",

    version:
      "1.0.0",

    exportedAt:
      new Date().toISOString(),

    profile:
      userProfile,

    tasks:
      tasks,

    notifications:
      notifications

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    `tasktime-backup-${getLocalDateString()}.json`;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "📤",
    "Data berhasil diexport"
  );

}


/* =========================================================
   CLEAR DATA
   ========================================================= */

function clearAllData() {

  const confirmed =
    confirm(
      "Yakin ingin menghapus SEMUA data TaskTime?"
    );


  if (!confirmed) return;


  tasks = [];

  notifications = [];

  userProfile = {

    name: "",

    photo: ""

  };


  saveTasks();

  saveNotifications();

  saveProfile();


  renderAll();

  updateProfileUI();


  showToast(
    "🗑️",
    "Semua data berhasil dihapus"
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const input =
    $("taskSearchInput");

  const clearButton =
    $("clearSearchButton");


  if (input) {

    input.addEventListener(
      "input",
      () => {

        currentSearch =
          input.value.trim();

        renderAllTasks();

      }
    );

  }


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      () => {

        if (input) {

          input.value =
            "";

        }

        currentSearch =
          "";

        renderAllTasks();

      }
    );

  }

}


/* =========================================================
   FILTER
   ========================================================= */

function setupFilters() {

  document
    .querySelectorAll(
      ".filter-button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".filter-button"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );


            button.classList.add(
              "active"
            );


            currentFilter =
              button.dataset.filter ||
              "all";


            renderAllTasks();

          }
        );

      }
    );

}


/* =========================================================
   GLOBAL TASK CLICK
   ========================================================= */

function setupTaskEvents() {

  document.addEventListener(
    "click",
    event => {

      const actionElement =
        event.target.closest(
          "[data-action]"
        );


      if (!actionElement) return;


      const action =
        actionElement.dataset.action;


      const id =
        actionElement.dataset.id;


      if (
        action ===
        "complete"
      ) {

        event.stopPropagation();

        toggleTaskComplete(
          id
        );

      }


      if (
        action ===
        "open"
      ) {

        openTaskModal(
          id
        );

      }

    }
  );

}


/* =========================================================
   NAVIGATION EVENTS
   ========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            navigateTo(
              button.dataset.page
            );

          }
        );

      }
    );


  if (
    $("bottomAddButton")
  ) {

    $("bottomAddButton")
      .addEventListener(
        "click",
        () =>
          navigateTo("add")
      );

  }


  if (
    $("quickAddButton")
  ) {

    $("quickAddButton")
      .addEventListener(
        "click",
        () =>
          navigateTo("add")
      );

  }


  if (
    $("addTaskFromTasksPage")
  ) {

    $("addTaskFromTasksPage")
      .addEventListener(
        "click",
        () =>
          navigateTo("add")
      );

  }


  if (
    $("viewAllTasksButton")
  ) {

    $("viewAllTasksButton")
      .addEventListener(
        "click",
        () =>
          navigateTo("tasks")
      );

  }


  if (
    $("profileButton")
  ) {

    $("profileButton")
      .addEventListener(
        "click",
        () =>
          navigateTo("profile")
      );

  }

}


/* =========================================================
   CALENDAR NAVIGATION
   ========================================================= */

function setupCalendarNavigation() {

  if (
    $("previousMonthButton")
  ) {

    $("previousMonthButton")
      .addEventListener(
        "click",
        () => {

          currentCalendarDate =
            new Date(
              currentCalendarDate
                .getFullYear(),
              currentCalendarDate
                .getMonth() - 1,
              1
            );


          renderCalendar();

        }
      );

  }


  if (
    $("nextMonthButton")
  ) {

    $("nextMonthButton")
      .addEventListener(
        "click",
        () => {

          currentCalendarDate =
            new Date(
              currentCalendarDate
                .getFullYear(),
              currentCalendarDate
                .getMonth() + 1,
              1
            );


          renderCalendar();

        }
      );

  }

}


/* =========================================================
   MODAL EVENTS
   ========================================================= */

function setupModal() {

  if (
    $("closeTaskModal")
  ) {

    $("closeTaskModal")
      .addEventListener(
        "click",
        closeTaskModal
      );

  }


  document
    .querySelector(
      "#taskModal .modal-overlay"
    )
    ?.addEventListener(
      "click",
      closeTaskModal
    );


  if (
    $("completeTaskButton")
  ) {

    $("completeTaskButton")
      .addEventListener(
        "click",
        () => {

          if (
            selectedTaskId
          ) {

            toggleTaskComplete(
              selectedTaskId
            );

            openTaskModal(
              selectedTaskId
            );

          }

        }
      );

  }


  if (
    $("deleteTaskButton")
  ) {

    $("deleteTaskButton")
      .addEventListener(
        "click",
        deleteSelectedTask
      );

  }


  if (
    $("editTaskButton")
  ) {

    $("editTaskButton")
      .addEventListener(
        "click",
        editSelectedTask
      );

  }

}


/* =========================================================
   PROFILE EVENTS
   ========================================================= */

function setupProfile() {

  if (
    $("saveProfileButton")
  ) {

    $("saveProfileButton")
      .addEventListener(
        "click",
        saveUserProfile
      );

  }


  createProfileUpload();

}


/* =========================================================
   NOTIFICATION EVENTS
   ========================================================= */

function setupNotifications() {

  if (
    $("notificationButton")
  ) {

    $("notificationButton")
      .addEventListener(
        "click",
        toggleNotificationPanel
      );

  }


  if (
    $("closeNotificationPanel")
  ) {

    $("closeNotificationPanel")
      .addEventListener(
        "click",
        () => {

          $("notificationPanel")
            .classList.add(
              "hidden"
            );

        }
      );

  }


  if (
    $("enableNotificationButton")
  ) {

    $("enableNotificationButton")
      .addEventListener(
        "click",
        enableNotifications
      );

  }

}


/* =========================================================
   DATA EVENTS
   ========================================================= */

function setupDataButtons() {

  if (
    $("exportDataButton")
  ) {

    $("exportDataButton")
      .addEventListener(
        "click",
        exportData
      );

  }


  if (
    $("clearDataButton")
  ) {

    $("clearDataButton")
      .addEventListener(
        "click",
        clearAllData
      );

  }

}


/* =========================================================
   TASK FORM
   ========================================================= */

function setupTaskForm() {

  const form =
    $("taskForm");

  if (!form) return;


  form.addEventListener(
    "submit",
    handleTaskSubmit
  );


  form.addEventListener(
    "reset",
    () => {

      setTimeout(
        setDefaultTaskDate,
        0
      );

    }
  );

}


/* =========================================================
   PWA INSTALL
   ========================================================= */

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredInstallPrompt =
      event;

  }
);


async function installPWA() {

  if (
    !deferredInstallPrompt
  ) {

    showToast(
      "ℹ️",
      "Aplikasi sudah terinstall atau browser belum mendukung install"
    );

    return;

  }


  deferredInstallPrompt.prompt();


  const result =
    await deferredInstallPrompt.userChoice;


  if (
    result.outcome ===
    "accepted"
  ) {

    showToast(
      "📲",
      "TaskTime berhasil diinstall"
    );

  }


  deferredInstallPrompt =
    null;

}


if (
  $("installAppButton")
) {

  $("installAppButton")
    .addEventListener(
      "click",
      installPWA
    );

}


/* =========================================================
   ONLINE / OFFLINE
   ========================================================= */

function updateOnlineStatus() {

  const indicator =
    $("offlineIndicator");

  if (!indicator) return;


  if (
    navigator.onLine
  ) {

    indicator.classList.add(
      "hidden"
    );

  } else {

    indicator.classList.remove(
      "hidden"
    );

  }

}


window.addEventListener(
  "online",
  () => {

    updateOnlineStatus();

    showToast(
      "🌐",
      "Koneksi internet kembali"
    );

  }
);


window.addEventListener(
  "offline",
  () => {

    updateOnlineStatus();

    showToast(
      "📡",
      "Kamu sedang offline"
    );

  }
);


/* =========================================================
   WELCOME DATE
   ========================================================= */

function updateWelcome() {

  const greeting =
    $("currentGreeting");

  const date =
    $("todayDate");


  if (greeting) {

    greeting.textContent =
      getGreeting();

  }


  if (date) {

    date.textContent =
      new Date()
        .toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }
        );

  }

}


/* =========================================================
   SERVICE WORKER MESSAGE
   ========================================================= */

if (
  "serviceWorker" in navigator
) {

  navigator.serviceWorker
    .addEventListener(
      "message",
      event => {

        if (
          event.data?.type ===
          "TASKTIME_NOTIFICATION"
        ) {

          const data =
            event.data;


          addNotification(
            "🔔",
            data.title ||
              "TaskTime",
            data.body ||
              "Kamu memiliki pengingat tugas."
          );


          showToast(
            "🔔",
            data.body ||
              "Pengingat tugas"
          );

        }

      }
    );

}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function initializeTaskTime() {

  console.log(
    "TaskTime sedang dimulai..."
  );


  updateWelcome();

  updateProfileUI();

  updateOnlineStatus();

  setDefaultTaskDate();

  setupNavigation();

  setupCalendarNavigation();

  setupModal();

  setupNotifications();

  setupProfile();

  setupDataButtons();

  setupTaskForm();

  setupSearch();

  setupFilters
