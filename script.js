/* =========================================================
   TASKTIME - SCRIPT.JS
   FULL FINAL VERSION
   PWA + FIREBASE FCM + LOCAL STORAGE
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "tasktime_tasks";
const PROFILE_KEY = "tasktime_profile";
const NOTIFICATION_KEY = "tasktime_notifications";
const FCM_TOKEN_KEY = "tasktime_fcm_token";


let tasks = [];
let notifications = [];

let currentFilter = "all";
let currentSearch = "";

let selectedTaskId = null;

let currentCalendarDate = new Date();
let selectedCalendarDate = new Date();

let deferredInstallPrompt = null;


/* =========================================================
   FIREBASE VARIABLES
========================================================= */

let firebaseMessaging = null;
let firebaseGetToken = null;
let firebaseVapidKey = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log("TaskTime memulai...");

    loadData();

    initializeFirebase();

    initializeNavigation();

    initializeTaskForm();

    initializeTaskFilters();

    initializeSearch();

    initializeModal();

    initializeCalendar();

    initializeProfile();

    initializeNotifications();

    initializeButtons();

    initializePWAInstall();

    updateAllUI();

    setDefaultTaskDate();

    updateGreeting();

    console.log("TaskTime berhasil dimuat.");

  }
);


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

function initializeFirebase() {

  if (
    !window.taskTimeFirebase
  ) {

    console.warn(
      "Firebase belum tersedia."
    );

    return;

  }


  firebaseMessaging =
    window.taskTimeFirebase.messaging;

  firebaseGetToken =
    window.taskTimeFirebase.getToken;

  firebaseVapidKey =
    window.taskTimeFirebase.VAPID_KEY;


  if (
    firebaseMessaging
  ) {

    console.log(
      "Firebase Messaging siap digunakan."
    );

  }

}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

  try {

    const savedTasks =
      localStorage.getItem(
        STORAGE_KEY
      );


    const savedNotifications =
      localStorage.getItem(
        NOTIFICATION_KEY
      );


    if (
      savedTasks
    ) {

      tasks =
        JSON.parse(
          savedTasks
        );

    } else {

      tasks = [];

    }


    if (
      savedNotifications
    ) {

      notifications =
        JSON.parse(
          savedNotifications
        );

    } else {

      notifications = [];

    }

  } catch (error) {

    console.error(
      "Gagal membaca data:",
      error
    );

    tasks = [];

    notifications = [];

  }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveTasks() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );

}


function saveNotifications() {

  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify(notifications)
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

  const navItems =
    document.querySelectorAll(
      ".nav-item[data-page]"
    );


  navItems.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          navigateTo(
            this.dataset.page
          );

        }
      );

    }
  );


  const bottomAddButton =
    document.getElementById(
      "bottomAddButton"
    );


  if (
    bottomAddButton
  ) {

    bottomAddButton.addEventListener(
      "click",
      function () {

        navigateTo("add");

      }
    );

  }


  const quickAddButton =
    document.getElementById(
      "quickAddButton"
    );


  if (
    quickAddButton
  ) {

    quickAddButton.addEventListener(
      "click",
      function () {

        navigateTo("add");

      }
    );

  }


  const addTaskFromTasksPage =
    document.getElementById(
      "addTaskFromTasksPage"
    );


  if (
    addTaskFromTasksPage
  ) {

    addTaskFromTasksPage.addEventListener(
      "click",
      function () {

        navigateTo("add");

      }
    );

  }


  const viewAllTasksButton =
    document.getElementById(
      "viewAllTasksButton"
    );


  if (
    viewAllTasksButton
  ) {

    viewAllTasksButton.addEventListener(
      "click",
      function () {

        navigateTo("tasks");

      }
    );

  }

}


function navigateTo(
  pageName
) {

  const pages =
    document.querySelectorAll(
      ".page"
    );


  pages.forEach(
    function (page) {

      page.classList.remove(
        "active"
      );

    }
  );


  const targetPage =
    document.getElementById(
      pageName + "Page"
    );


  if (
    targetPage
  ) {

    targetPage.classList.add(
      "active"
    );

  }


  const navItems =
    document.querySelectorAll(
      ".nav-item[data-page]"
    );


  navItems.forEach(
    function (item) {

      item.classList.remove(
        "active"
      );


      if (
        item.dataset.page ===
        pageName
      ) {

        item.classList.add(
          "active"
        );

      }

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

    renderSelectedDateTasks();

  }


  if (
    pageName ===
    "profile"
  ) {

    loadProfile();

  }

}


/* =========================================================
   TASK FORM
========================================================= */

function initializeTaskForm() {

  const form =
    document.getElementById(
      "taskForm"
    );


  if (
    !form
  ) {

    return;

  }


  form.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();

      addTask();

    }
  );


  const resetButton =
    document.getElementById(
      "resetTaskForm"
    );


  if (
    resetButton
  ) {

    resetButton.addEventListener(
      "click",
      function () {

        setTimeout(
          setDefaultTaskDate,
          50
        );

      }
    );

  }

}


function setDefaultTaskDate() {

  const dateInput =
    document.getElementById(
      "taskDate"
    );


  if (
    !dateInput
  ) {

    return;

  }


  dateInput.value =
    formatDateInput(
      new Date()
    );

}


/* =========================================================
   ADD TASK
========================================================= */

async function addTask() {

  const titleInput =
    document.getElementById(
      "taskTitle"
    );


  const descriptionInput =
    document.getElementById(
      "taskDescription"
    );


  const dateInput =
    document.getElementById(
      "taskDate"
    );


  const timeInput =
    document.getElementById(
      "taskTime"
    );


  const categoryInput =
    document.getElementById(
      "taskCategory"
    );


  const reminderInput =
    document.getElementById(
      "taskReminder"
    );


  const priorityInput =
    document.querySelector(
      'input[name="taskPriority"]:checked'
    );


  if (
    !titleInput ||
    !titleInput.value.trim()
  ) {

    showToast(
      "⚠️",
      "Nama tugas harus diisi."
    );

    return;

  }


  const task = {

    id:
      Date.now().toString(),

    title:
      titleInput.value.trim(),

    description:
      descriptionInput
      ? descriptionInput.value.trim()
      : "",

    date:
      dateInput
      ? dateInput.value
      : formatDateInput(
          new Date()
        ),

    time:
      timeInput
      ? timeInput.value
      : "",

    category:
      categoryInput
      ? categoryInput.value
      : "lainnya",

    priority:
      priorityInput
      ? priorityInput.value
      : "low",

    reminder:
      reminderInput
      ? reminderInput.checked
      : false,

    completed:
      false,

    createdAt:
      new Date().toISOString()

  };


  tasks.push(
    task
  );


  saveTasks();


  createTaskNotification(
    task
  );


  if (
    task.reminder &&
    task.time
  ) {

    scheduleFirebaseTaskReminder(
      task
    );

  }


  formReset();

  updateAllUI();

  showToast(
    "✅",
    "Tugas berhasil ditambahkan."
  );


  navigateTo(
    "home"
  );

}


/* =========================================================
   FIREBASE TASK REMINDER
========================================================= */

async function scheduleFirebaseTaskReminder(
  task
) {

  console.log(
    "Pengingat Firebase dibuat untuk:",
    task.title
  );

  /*
    CATATAN:

    Firebase Cloud Messaging tidak menjadwalkan
    notifikasi berdasarkan waktu secara langsung
    dari browser.

    Untuk notifikasi pada waktu tertentu saat aplikasi
    benar-benar ditutup, diperlukan backend / Cloud
    Functions / server scheduler.

    TaskTime tetap menyimpan informasi reminder di
    localStorage.

    Untuk APK Capacitor, penjadwalan lokal lebih cocok
    menggunakan Capacitor Local Notifications.
  */

}


/* =========================================================
   TOGGLE TASK
========================================================= */

async function toggleTask(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return (
          item.id ===
          taskId
        );

      }
    );


  if (
    !task
  ) {

    return;

  }


  task.completed =
    !task.completed;


  saveTasks();

  updateAllUI();


  if (
    task.completed
  ) {

    showToast(
      "🎉",
      "Tugas berhasil diselesaikan!"
    );

  } else {

    showToast(
      "↩️",
      "Tugas dikembalikan."
    );

  }

}


/* =========================================================
   FORM RESET
========================================================= */

function formReset() {

  const form =
    document.getElementById(
      "taskForm"
    );


  if (
    !form
  ) {

    return;

  }


  form.reset();

  setDefaultTaskDate();

}


/* =========================================================
   UPDATE ALL UI
========================================================= */

function updateAllUI() {

  renderTodayTasks();

  renderUpcomingTasks();

  renderAllTasks();

  renderSelectedDateTasks();

  updateStatistics();

  updateNotificationBadge();

  renderNotifications();

}


/* =========================================================
   TODAY TASKS
========================================================= */

function renderTodayTasks() {

  const container =
    document.getElementById(
      "todayTaskList"
    );


  if (
    !container
  ) {

    return;

  }


  const today =
    formatDateInput(
      new Date()
    );


  const todayTasks =
    tasks.filter(
      function (task) {

        return (
          task.date ===
          today
        );

      }
    );


  renderTaskCollection(
    container,
    todayTasks,
    "today"
  );

}


/* =========================================================
   UPCOMING TASKS
========================================================= */

function renderUpcomingTasks() {

  const container =
    document.getElementById(
      "upcomingTaskList"
    );


  if (
    !container
  ) {

    return;

  }


  const today =
    formatDateInput(
      new Date()
    );


  const upcoming =
    tasks
      .filter(
        function (task) {

          return (
            !task.completed &&
            task.date >= today
          );

        }
      )
      .sort(
        function (a, b) {

          return (
            getTaskDate(a) -
            getTaskDate(b)
          );

        }
      )
      .slice(
        0,
        5
      );


  renderTaskCollection(
    container,
    upcoming,
    "upcoming"
  );

}


/* =========================================================
   ALL TASKS
========================================================= */

function renderAllTasks() {

  const container =
    document.getElementById(
      "allTaskList"
    );


  if (
    !container
  ) {

    return;

  }


  let filtered =
    [...tasks];


  if (
    currentFilter ===
    "pending"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return (
            !task.completed
          );

        }
      );

  }


  if (
    currentFilter ===
    "completed"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return (
            task.completed
          );

        }
      );

  }


  if (
    currentFilter ===
    "priority"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return (
            task.priority ===
            "high"
          );

        }
      );

  }


  if (
    currentSearch
  ) {

    filtered =
      filtered.filter(
        function (task) {

          const text =
            (
              task.title +
              " " +
              task.description
            ).toLowerCase();


          return text.includes(
            currentSearch.toLowerCase()
          );

        }
      );

  }


  filtered.sort(
    function (a, b) {

      return (
        getTaskDate(a) -
        getTaskDate(b)
      );

    }
  );


  renderTaskCollection(
    container,
    filtered,
    "all"
  );

}


/* =========================================================
   TASK COLLECTION
========================================================= */

function renderTaskCollection(
  container,
  taskCollection,
  type
) {

  container.innerHTML = "";


  if (
    taskCollection.length ===
    0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-state";


    empty.innerHTML = `

      <div class="empty-icon">
        📝
      </div>

      <h3>
        Belum ada tugas
      </h3>

      <p>
        Tidak ada tugas yang sesuai.
      </p>

    `;


    container.appendChild(
      empty
    );


    return;

  }


  taskCollection.forEach(
    function (task) {

      container.appendChild(
        createTaskCard(
          task,
          type
        )
      );

    }
  );

}


/* =========================================================
   CREATE TASK CARD
========================================================= */

function createTaskCard(
  task,
  type
) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "task-card";


  if (
    task.completed
  ) {

    card.classList.add(
      "completed"
    );

  }


  const priorityText = {

    low:
      "Rendah",

    medium:
      "Sedang",

    high:
      "Tinggi"

  };


  const categoryText = {

    sekolah:
      "🏫 Sekolah",

    kuliah:
      "🎓 Kuliah",

    kerja:
      "💼 Kerja",

    pribadi:
      "👤 Pribadi",

    lainnya:
      "📌 Lainnya"

  };


  card.innerHTML = `

    <div class="task-check">

      <button
        class="check-button"
        type="button"
      >

        ${
          task.completed
          ? "✓"
          : ""
        }

      </button>

    </div>


    <div class="task-content">

      <h3>
        ${escapeHTML(
          task.title
        )}
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
          📅
          ${formatDisplayDate(
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

          ${
            categoryText[
              task.category
            ] ||
            "📌 Lainnya"
          }

        </span>


        <span
          class="
            task-priority
            priority-${task.priority}
          "
        >

          ${
            priorityText[
              task.priority
            ] ||
            "Rendah"
          }

        </span>


        ${
          task.reminder
          ? `

            <span>
              🔔
            </span>

          `
          : ""
        }

      </div>

    </div>


    <button
      class="task-more-button"
      type="button"
    >
      ⋮
    </button>

  `;


  const checkButton =
    card.querySelector(
      ".check-button"
    );


  if (
    checkButton
  ) {

    checkButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        toggleTask(
          task.id
        );

      }
    );

  }


  const detailButton =
    card.querySelector(
      ".task-more-button"
    );


  if (
    detailButton
  ) {

    detailButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        openTaskModal(
          task.id
        );

      }
    );

  }


  card.addEventListener(
    "click",
    function () {

      openTaskModal(
        task.id
      );

    }
  );


  return card;

}


/* =========================================================
   MODAL
========================================================= */

function initializeModal() {

  const closeButton =
    document.getElementById(
      "closeTaskModal"
    );


  if (
    closeButton
  ) {

    closeButton.addEventListener(
      "click",
      closeTaskModal
    );

  }


  const modal =
    document.getElementById(
      "taskModal"
    );


  if (
    modal
  ) {

    const overlay =
      modal.querySelector(
        ".modal-overlay"
      );


    if (
      overlay
    ) {

      overlay.addEventListener(
        "click",
        closeTaskModal
      );

    }

  }


  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );


  if (
    completeButton
  ) {

    completeButton.addEventListener(
      "click",
      function () {

        if (
          selectedTaskId
        ) {

          toggleTask(
            selectedTaskId
          );

          setTimeout(
            function () {

              if (
                selectedTaskId
              ) {

                openTaskModal(
                  selectedTaskId
                );

              }

            },
            100
          );

        }

      }
    );

  }


  const deleteButton =
    document.getElementById(
      "deleteTaskButton"
    );


  if (
    deleteButton
  ) {

    deleteButton.addEventListener(
      "click",
      function () {

        deleteTask(
          selectedTaskId
        );

      }
    );

  }


  const editButton =
    document.getElementById(
      "editTaskButton"
    );


  if (
    editButton
  ) {

    editButton.addEventListener(
      "click",
      function () {

        editTask(
          selectedTaskId
        );

      }
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeTaskModal();

      }

    }
  );

}


/* =========================================================
   OPEN TASK MODAL
========================================================= */

function openTaskModal(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return (
          item.id ===
          taskId
        );

      }
    );


  if (
    !task
  ) {

    return;

  }


  selectedTaskId =
    taskId;


  const modal =
    document.getElementById(
      "taskModal"
    );


  const content =
    document.getElementById(
      "taskModalContent"
    );


  if (
    !modal ||
    !content
  ) {

    return;

  }


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

          <p>
            ${escapeHTML(
              task.description
            )}
          </p>

        `
        : ""
      }


      <div class="detail-row">

        📅

        <strong>
          ${formatDisplayDate(
            task.date
          )}
        </strong>

      </div>


      ${
        task.time
        ? `

          <div class="detail-row">

            ⏰

            <strong>
              ${task.time}
            </strong>

          </div>

        `
        : ""
      }


      <div class="detail-row">

        📂

        <strong>
          ${escapeHTML(
            task.category
          )}
        </strong>

      </div>


      <div class="detail-row">

        🔥

        <strong>
          ${escapeHTML(
            task.priority
          )}
        </strong>

      </div>


      <div class="detail-row">

        ${
          task.completed
          ? "✅ Tugas selesai"
          : "⏳ Belum selesai"
        }

      </div>

    </div>

  `;


  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );


  if (
    completeButton
  ) {

    completeButton.textContent =
      task.completed
      ? "↩️ Tandai Belum Selesai"
      : "✓ Tandai Selesai";

  }


  modal.classList.remove(
    "hidden"
  );


  modal.classList.add(
    "active"
  );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTaskModal() {

  const modal =
    document.getElementById(
      "taskModal"
    );


  if (
    !modal
  ) {

    return;

  }


  modal.classList.remove(
    "active"
  );


  modal.classList.add(
    "hidden"
  );


  selectedTaskId =
    null;

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return (
          item.id ===
          taskId
        );

      }
    );


  if (
    !task
  ) {

    return;

  }


  const confirmed =
    confirm(
      `Hapus tugas "${task.title}"?`
    );


  if (
    !confirmed
  ) {

    return;

  }


  tasks =
    tasks.filter(
      function (item) {

        return (
          item.id !==
          taskId
        );

      }
    );


  saveTasks();

  closeTaskModal();

  updateAllUI();


  showToast(
    "🗑️",
    "Tugas berhasil dihapus."
  );

}


/* =========================================================
   EDIT TASK
========================================================= */

function editTask(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return (
          item.id ===
          taskId
        );

      }
    );


  if (
    !task
  ) {

    return;

  }


  const newTitle =
    prompt(
      "Nama tugas:",
      task.title
    );


  if (
    newTitle === null
  ) {

    return;

  }


  if (
    !newTitle.trim()
  ) {

    return;

  }


  task.title =
    newTitle.trim();


  saveTasks();

  closeTaskModal();

  updateAllUI();


  showToast(
    "✏️",
    "Tugas berhasil diperbarui."
  );

}


/* =========================================================
   FILTER
========================================================= */

function initializeTaskFilters() {

  const buttons =
    document.querySelectorAll(
      ".filter-button"
    );


  buttons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          buttons.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );


          this.classList.add(
            "active"
          );


          currentFilter =
            this.dataset.filter;


          renderAllTasks();

        }
      );

    }
  );

}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

  const input =
    document.getElementById(
      "taskSearchInput"
    );


  if (
    !input
  ) {

    return;

  }


  input.addEventListener(
    "input",
    function () {

      currentSearch =
        this.value.trim();


      renderAllTasks();

    }
  );


  const clearButton =
    document.getElementById(
      "clearSearchButton"
    );


  if (
    clearButton
  ) {

    clearButton.addEventListener(
      "click",
      function () {

        input.value = "";

        currentSearch = "";

        renderAllTasks();

        input.focus();

      }
    );

  }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

  const total =
    tasks.length;


  const completed =
    tasks.filter(
      function (task) {

        return (
          task.completed
        );

      }
    ).length;


  const pending =
    total -
    completed;


  const priority =
    tasks.filter(
      function (task) {

        return (
          task.priority ===
          "high" &&
          !task.completed
        );

      }
    ).length;


  setText(
    "totalTaskCount",
    total
  );


  setText(
    "completedTaskCount",
    completed
  );


  setText(
    "pendingTaskCount",
    pending
  );


  setText(
    "priorityTaskCount",
    priority
  );

}


/* =========================================================
   CALENDAR
========================================================= */

function initializeCalendar() {

  const previous =
    document.getElementById(
      "previousMonthButton"
    );


  const next =
    document.getElementById(
      "nextMonthButton"
    );


  if (
    previous
  ) {

    previous.addEventListener(
      "click",
      function () {

        currentCalendarDate.setMonth(
          currentCalendarDate.getMonth() -
          1
        );


        renderCalendar();

      }
    );

  }


  if (
    next
  ) {

    next.addEventListener(
      "click",
      function () {

        currentCalendarDate.setMonth(
          currentCalendarDate.getMonth() +
          1
        );


        renderCalendar();

      }
    );

  }


  renderCalendar();

}


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderCalendar() {

  const daysContainer =
    document.getElementById(
      "calendarDays"
    );


  const monthTitle =
    document.getElementById(
      "calendarMonth"
    );


  if (
    !daysContainer
  ) {

    return;

  }


  const year =
    currentCalendarDate.getFullYear();


  const month =
    currentCalendarDate.getMonth();


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


  const monthNames = [

    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"

  ];


  if (
    monthTitle
  ) {

    monthTitle.textContent =
      `${monthNames[month]} ${year}`;

  }


  daysContainer.innerHTML = "";


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "calendar-day empty";


    daysContainer.appendChild(
      empty
    );

  }


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
      formatDateInput(
        date
      );


    const dayElement =
      document.createElement(
        "button"
      );


    dayElement.type =
      "button";


    dayElement.className =
      "calendar-day";


    dayElement.textContent =
      day;


    const hasTask =
      tasks.some(
        function (task) {

          return (
            task.date ===
            dateString
          );

        }
      );


    if (
      hasTask
    ) {

      dayElement.classList.add(
        "has-task"
      );

    }


    if (
      dateString ===
      formatDateInput(
        new Date()
      )
    ) {

      dayElement.classList.add(
        "today"
      );

    }


    if (
      dateString ===
      formatDateInput(
        selectedCalendarDate
      )
    ) {

      dayElement.classList.add(
        "selected"
      );

    }


    dayElement.addEventListener(
      "click",
      function () {

        selectedCalendarDate =
          date;

        renderCalendar();

        renderSelectedDateTasks();

      }
    );


    daysContainer.appendChild(
      dayElement
    );

  }

}


/* =========================================================
   SELECTED DATE TASKS
========================================================= */

function renderSelectedDateTasks() {

  const container =
    document.getElementById(
      "selectedDateTaskList"
    );


  const title =
    document.getElementById(
      "selectedDateTitle"
    );


  if (
    !container
  ) {

    return;

  }


  const selectedDate =
    formatDateInput(
      selectedCalendarDate
    );


  const selectedTasks =
    tasks.filter(
      function (task) {

        return (
          task.date ===
          selectedDate
        );

      }
    );


  if (
    title
  ) {

    title.textContent =
      formatDisplayDate(
        selectedDate
      );

  }


  renderTaskCollection(
    container,
    selectedTasks,
    "calendar"
  );

}


/* =========================================================
   PROFILE
========================================================= */

function initializeProfile() {

  const saveButton =
    document.getElementById(
      "saveProfileButton"
    );


  if (
    saveButton
  ) {

    saveButton.addEventListener(
      "click",
      saveProfile
    );

  }


  loadProfile();

}


function saveProfile() {

  const input =
    document.getElementById(
      "userName"
    );


  if (
    !input
  ) {

    return;

  }


  const name =
    input.value.trim();


  if (
    !name
  ) {

    showToast(
      "⚠️",
      "Masukkan nama terlebih dahulu."
    );

    return;

  }


  localStorage.setItem(
    PROFILE_KEY,
    name
  );


  updateProfileDisplay();


  showToast(
    "👤",
    "Profil berhasil disimpan."
  );

}


function loadProfile() {

  const input =
    document.getElementById(
      "userName"
    );


  const name =
    localStorage.getItem(
      PROFILE_KEY
    );


  if (
    input &&
    name
  ) {

    input.value =
      name;

  }


  updateProfileDisplay();

}


function updateProfileDisplay() {

  const name =
    localStorage.getItem(
      PROFILE_KEY
    ) ||
    "Pengguna TaskTime";


  const initial =
    name
      .charAt(0)
      .toUpperCase();


  setText(
    "profileNameDisplay",
    name
  );


  setText(
    "profileInitial",
    initial
  );


  setText(
    "largeProfileInitial",
    initial
  );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function initializeNotifications() {

  const button =
    document.getElementById(
      "enableNotificationButton"
    );


  const headerButton =
    document.getElementById(
      "notificationButton"
    );


  if (
    button
  ) {

    button.addEventListener(
      "click",
      enableNotifications
    );

  }


  if (
    headerButton
  ) {

    headerButton.addEventListener(
      "click",
      toggleNotificationPanel
    );

  }


  const closeButton =
    document.getElementById(
      "closeNotificationPanel"
    );


  if (
    closeButton
  ) {

    closeButton.addEventListener(
      "click",
      function () {

        const panel =
          document.getElementById(
            "notificationPanel"
          );


        if (
          panel
        ) {

          panel.classList.add(
            "hidden"
          );

        }

      }
    );

  }

}


/* =========================================================
   ENABLE NOTIFICATIONS
========================================================= */

async function enableNotifications() {

  try {

    if (
      !("Notification" in window)
    ) {

      showToast(
        "❌",
        "Browser tidak mendukung notifikasi."
      );

      return;

    }


    const permission =
      await Notification.requestPermission();


    if (
      permission !==
      "granted"
    ) {

      showToast(
        "⚠️",
        "Izin notifikasi belum diberikan."
      );

      return;

    }


    if (
      !firebaseMessaging ||
      !firebaseGetToken ||
      !firebaseVapidKey
    ) {

      showToast(
        "⚠️",
        "Firebase Messaging belum siap."
      );

      return;

    }


    let registration = null;


    if (
      "serviceWorker" in navigator
    ) {

      registration =
        await navigator.serviceWorker.ready;

    }


    const token =
      await firebaseGetToken(
        firebaseMessaging,
        {

          vapidKey:
            firebaseVapidKey,

          serviceWorkerRegistration:
            registration

        }
      );


    if (
      token
    ) {

      localStorage.setItem(
        FCM_TOKEN_KEY,
        token
      );


      console.log(
        "FCM Token:",
        token
      );


      showToast(
        "🔔",
        "Notifikasi berhasil diaktifkan."
      );

    } else {

      showToast(
        "⚠️",
        "Token notifikasi tidak berhasil dibuat."
      );

    }

  } catch (error) {

    console.error(
      "Notifikasi error:",
      error
    );


    showToast(
      "❌",
      "Gagal mengaktifkan notifikasi."
    );

  }

}


/* =========================================================
   CREATE NOTIFICATION HISTORY
========================================================= */

function createTaskNotification(
  task
) {

  notifications.unshift({

    id:
      Date.now().toString(),

    taskId:
      task.id,

    title:
      task.title,

    date:
      task.date,

    time:
      task.time,

    read:
      false

  });


  notifications =
    notifications.slice(
      0,
      50
    );


  saveNotifications();

}


/* =========================================================
   NOTIFICATION BADGE
========================================================= */

function updateNotificationBadge() {

  const badge =
    document.getElementById(
      "notificationBadge"
    );


  if (
    !badge
  ) {

    return;

  }


  const unread =
    notifications.filter(
      function (item) {

        return (
          !item.read
        );

      }
    ).length;


  badge.textContent =
    unread;


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
    document.getElementById(
      "notificationList"
    );


  if (
    !container
  ) {

    return;

  }


  container.innerHTML = "";


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


  notifications
    .slice(
      0,
      20
    )
    .forEach(
      function (notification) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "notification-item";


        item.innerHTML = `

          <span>
            🔔
          </span>

          <div>

            <strong>
              ${escapeHTML(
                notification.title ||
                "Notifikasi TaskTime"
              )}
            </strong>

            <small>
              ${
                notification.date
                ? formatDisplayDate(
                    notification.date
                  )
                : ""
              }

              ${
                notification.time
                ? " • " +
                  notification.time
                : ""
              }
            </small>

          </div>

        `;


        container.appendChild(
          item
        );

      }
    );

}


/* =========================================================
   NOTIFICATION PANEL
========================================================= */

function toggleNotificationPanel() {

  const panel =
    document.getElementById(
      "notificationPanel"
    );


  if (
    !panel
  ) {

    return;

  }


  panel.classList.toggle(
    "hidden"
  );


  notifications =
    notifications.map(
      function (item) {

        return {

          ...item,

          read:
            true

        };

      }
    );


  saveNotifications();

  updateNotificationBadge();

}


/* =========================================================
   EXTRA BUTTONS
========================================================= */

function initializeButtons() {

  const profileButton =
    document.getElementById(
      "profileButton"
    );


  if (
    profileButton
  ) {

    profileButton.addEventListener(
      "click",
      function () {

        navigateTo(
          "profile"
        );

      }
    );

  }


  const exportButton =
    document.getElementById(
      "exportDataButton"
    );


  if (
    exportButton
  ) {

    exportButton.addEventListener(
      "click",
      exportData
    );

  }


  const clearButton =
    document.getElementById(
      "clearDataButton"
    );


  if (
    clearButton
  ) {

    clearButton.addEventListener(
      "click",
      clearAllData
    );

  }

}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

  const data = {

    tasks:
      tasks,

    notifications:
      notifications,

    profile:
      localStorage.getItem(
        PROFILE_KEY
      ),

    exportedAt:
      new Date().toISOString()

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
    "tasktime-backup.json";


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
    "Data berhasil diekspor."
  );

}


/* =========================================================
   CLEAR DATA
========================================================= */

function clearAllData() {

  const confirmed =
    confirm(
      "Yakin ingin menghapus semua tugas dan notifikasi?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  tasks = [];

  notifications = [];


  localStorage.removeItem(
    STORAGE_KEY
  );


  localStorage.removeItem(
    NOTIFICATION_KEY
  );


  updateAllUI();


  showToast(
    "🗑️",
    "Semua data berhasil dihapus."
  );

}


/* =========================================================
   GREETING
========================================================= */

function updateGreeting() {

  const hour =
    new Date()
      .getHours();


  let greeting;


  if (
    hour < 11
  ) {

    greeting =
      "Selamat pagi ☀️";

  } else if (
    hour < 15
  ) {

    greeting =
      "Selamat siang 🌤️";

  } else if (
    hour < 18
  ) {

    greeting =
      "Selamat sore 🌇";

  } else {

    greeting =
      "Selamat malam 🌙";

  }


  setText(
    "currentGreeting",
    greeting
  );


  setText(
    "todayDate",
    formatDisplayDate(
      formatDateInput(
        new Date()
      )
    )
  );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  icon,
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );


  const toastIcon =
    document.getElementById(
      "toastIcon"
    );


  const toastMessage =
    document.getElementById(
      "toastMessage"
    );


  if (
    !toast ||
    !toastIcon ||
    !toastMessage
  ) {

    return;

  }


  toastIcon.textContent =
    icon;


  toastMessage.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    function () {

      toast.classList.remove(
        "show"
      );

    },
    3000
  );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function formatDateInput(
  date
) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}-${month}-${day}`
  );

}


function formatDisplayDate(
  dateString
) {

  if (
    !dateString
  ) {

    return "-";

  }


  const date =
    new Date(
      dateString +
      "T00:00:00"
    );


  return date.toLocaleDateString(
    "id-ID",
    {

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric"

    }
  );

}


function getTaskDate(
  task
) {

  const date =
    new Date(
      `${task.date}T${
        task.time ||
        "00:00"
      }`
    );


  return date.getTime();

}


/* =========================================================
   TEXT HELPERS
========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.textContent =
      value;

  }

}


function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text || "";


  return div.innerHTML;

}


/* =========================================================
   PWA INSTALL
========================================================= */

function initializePWAInstall() {

  const installButton =
    document.getElementById(
      "installAppButton"
    );


  if (
    installButton
  ) {

    installButton.style.display =
      "none";

  }


  window.addEventListener(
    "beforeinstallprompt",
    function (event) {

      event.preventDefault();


      deferredInstallPrompt =
        event;


      if (
        installButton
      ) {

        installButton.style.display =
          "block";

      }

    }
  );


  if (
    installButton
  ) {

    installButton.addEventListener(
      "click",
      installTaskTime
    );

  }

}


async function installTaskTime() {

  if (
    !deferredInstallPrompt
  ) {

    showToast(
      "ℹ️",
      "TaskTime belum tersedia untuk di-install."
    );

    return;

  }


  deferredInstallPrompt.prompt();


  const result =
    await deferredInstallPrompt.userChoice;


  console.log(
    "Hasil install:",
    result.outcome
  );


  deferredInstallPrompt =
    null;

}


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
  function () {

    updateGreeting();

  },
  60000
);


/* =========================================================
   EXPOSE FUNCTIONS TO WINDOW
   Agar Firebase module di index.html
   dapat mengakses fungsi ini
========================================================= */

window.showToast =
  showToast;


window.updateAllUI =
  updateAllUI;


window.renderNotifications =
  renderNotifications;


window.enableNotifications =
  enableNotifications;


/* =========================================================
   END OF SCRIPT
========================================================= */
