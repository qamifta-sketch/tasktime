 /* =========================================================
   TASKTIME — SCRIPT.JS
   FULL VERSION
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL DATA
   ========================================================= */

let tasks = [];
let notifications = [];

let currentFilter = "all";
let currentSearch = "";

let selectedTaskId = null;

let currentCalendarDate = new Date();
let selectedCalendarDate = new Date();

let deferredInstallPrompt = null;


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const TASKS_KEY = "taskTimeTasks";
const NOTIFICATIONS_KEY = "taskTimeNotifications";
const PROFILE_KEY = "taskTimeProfile";
const FCM_TOKEN_KEY = "taskTimeFCMToken";
const NOTIFICATION_ENABLED_KEY =
  "taskTimeNotificationEnabled";


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadData();

    setupNavigation();

    setupTaskForm();

    setupButtons();

    setupSearch();

    setupFilters();

    setupCalendar();

    setupNotifications();

    setupProfile();

    setupPWAInstall();

    updateGreeting();

    updateTodayDate();

    renderAll();

    updateConnectionStatus();

    updateNotificationButton();

    setTimeout(
      function () {

        const loading =
          document.getElementById(
            "loadingScreen"
          );

        if (loading) {

          loading.classList.add(
            "hidden"
          );

        }

      },
      600
    );

  }
);


/* =========================================================
   LOAD DATA
   ========================================================= */

function loadData() {

  try {

    const savedTasks =
      localStorage.getItem(
        TASKS_KEY
      );

    const savedNotifications =
      localStorage.getItem(
        NOTIFICATIONS_KEY
      );

    const savedProfile =
      localStorage.getItem(
        PROFILE_KEY
      );

    tasks =
      savedTasks
        ? JSON.parse(savedTasks)
        : [];

    notifications =
      savedNotifications
        ? JSON.parse(savedNotifications)
        : [];

    if (
      savedProfile
    ) {

      const profile =
        JSON.parse(
          savedProfile
        );

      const userName =
        document.getElementById(
          "userName"
        );

      if (
        userName &&
        profile.name
      ) {

        userName.value =
          profile.name;

      }

      updateProfileUI(
        profile.name,
        profile.photo
      );

    }

  } catch (error) {

    console.error(
      "Gagal memuat data:",
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
    TASKS_KEY,
    JSON.stringify(tasks)
  );

}


function saveNotifications() {

  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(
      notifications
    )
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(
    function (item) {

      item.addEventListener(
        "click",
        function () {

          const page =
            item.dataset.page;

          navigateTo(
            page
          );

        }
      );

    }
  );

}


function navigateTo(
  pageName
) {

  const pages =
    document.querySelectorAll(
      ".page"
    );

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  pages.forEach(
    function (page) {

      page.classList.remove(
        "active"
      );

    }
  );

  navItems.forEach(
    function (item) {

      item.classList.remove(
        "active"
      );

    }
  );

  const targetPage =
    document.querySelector(
      `[data-page="${pageName}"]`
    );

  if (
    targetPage &&
    targetPage.classList.contains(
      "page"
    )
  ) {

    targetPage.classList.add(
      "active"
    );

  }

  const activeNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );

  if (activeNav) {

    activeNav.classList.add(
      "active"
    );

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (
    pageName === "calendar"
  ) {

    renderCalendar();

  }

  if (
    pageName === "profile"
  ) {

    updateProfileUI();

  }

}


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons() {

  const quickAdd =
    document.getElementById(
      "quickAddButton"
    );

  if (quickAdd) {

    quickAdd.addEventListener(
      "click",
      function () {

        navigateTo(
          "add"
        );

      }
    );

  }


  const emptyAdd =
    document.getElementById(
      "emptyAddTaskButton"
    );

  if (emptyAdd) {

    emptyAdd.addEventListener(
      "click",
      function () {

        navigateTo(
          "add"
        );

      }
    );

  }


  const bottomAdd =
    document.getElementById(
      "bottomAddButton"
    );

  if (bottomAdd) {

    bottomAdd.addEventListener(
      "click",
      function () {

        resetTaskForm();

        navigateTo(
          "add"
        );

      }
    );

  }


  const tasksAdd =
    document.getElementById(
      "addTaskFromTasksPage"
    );

  if (tasksAdd) {

    tasksAdd.addEventListener(
      "click",
      function () {

        resetTaskForm();

        navigateTo(
          "add"
        );

      }
    );

  }


  const viewAll =
    document.getElementById(
      "viewAllTasksButton"
    );

  if (viewAll) {

    viewAll.addEventListener(
      "click",
      function () {

        navigateTo(
          "tasks"
        );

      }
    );

  }


  const profileButton =
    document.getElementById(
      "profileButton"
    );

  if (profileButton) {

    profileButton.addEventListener(
      "click",
      function () {

        navigateTo(
          "profile"
        );

      }
    );

  }


  const notificationButton =
    document.getElementById(
      "notificationButton"
    );

  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      toggleNotificationPanel
    );

  }


  const closeNotification =
    document.getElementById(
      "closeNotificationPanel"
    );

  if (closeNotification) {

    closeNotification.addEventListener(
      "click",
      closeNotificationPanel
    );

  }


  const closeModal =
    document.getElementById(
      "closeTaskModal"
    );

  if (closeModal) {

    closeModal.addEventListener(
      "click",
      closeTaskModal
    );

  }


  const modalOverlay =
    document.querySelector(
      ".modal-overlay"
    );

  if (modalOverlay) {

    modalOverlay.addEventListener(
      "click",
      closeTaskModal
    );

  }


  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );

  if (completeButton) {

    completeButton.addEventListener(
      "click",
      completeSelectedTask
    );

  }


  const editButton =
    document.getElementById(
      "editTaskButton"
    );

  if (editButton) {

    editButton.addEventListener(
      "click",
      editSelectedTask
    );

  }


  const deleteButton =
    document.getElementById(
      "deleteTaskButton"
    );

  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      deleteSelectedTask
    );

  }


  const exportButton =
    document.getElementById(
      "exportDataButton"
    );

  if (exportButton) {

    exportButton.addEventListener(
      "click",
      exportData
    );

  }


  const clearButton =
    document.getElementById(
      "clearDataButton"
    );

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearAllData
    );

  }


  const notificationEnable =
    document.getElementById(
      "enableNotificationButton"
    );

  if (notificationEnable) {

    notificationEnable.addEventListener(
      "click",
      enableNotifications
    );

  }

}


/* =========================================================
   TASK FORM
   ========================================================= */

function setupTaskForm() {

  const form =
    document.getElementById(
      "taskForm"
    );

  if (!form) return;

  const dateInput =
    document.getElementById(
      "taskDate"
    );

  if (
    dateInput &&
    !dateInput.value
  ) {

    dateInput.value =
      getLocalDateString();

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

  if (resetButton) {

    resetButton.addEventListener(
      "click",
      function () {

        setTimeout(
          function () {

            const date =
              document.getElementById(
                "taskDate"
              );

            if (date) {

              date.value =
                getLocalDateString();

            }

          },
          50
        );

      }
    );

  }

}


function addTask() {

  const title =
    document.getElementById(
      "taskTitle"
    ).value.trim();

  const description =
    document.getElementById(
      "taskDescription"
    ).value.trim();

  const date =
    document.getElementById(
      "taskDate"
    ).value;

  const time =
    document.getElementById(
      "taskTime"
    ).value;

  const category =
    document.getElementById(
      "taskCategory"
    ).value;

  const priorityElement =
    document.querySelector(
      'input[name="taskPriority"]:checked'
    );

  const priority =
    priorityElement
      ? priorityElement.value
      : "low";

  const reminder =
    document.getElementById(
      "taskReminder"
    ).checked;


  if (!title) {

    showToast(
      "⚠️",
      "Masukkan nama tugas."
    );

    return;

  }


  if (!date) {

    showToast(
      "⚠️",
      "Pilih tanggal tugas."
    );

    return;

  }


  const newTask = {

    id:
      Date.now().toString(),

    title:
      title,

    description:
      description,

    date:
      date,

    time:
      time,

    category:
      category,

    priority:
      priority,

    reminder:
      reminder,

    completed:
      false,

    createdAt:
      new Date().toISOString()

  };


  tasks.push(
    newTask
  );

  saveTasks();

  renderAll();

  resetTaskForm();

  navigateTo(
    "home"
  );

  showToast(
    "✓",
    "Tugas berhasil ditambahkan!"
  );

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetTaskForm() {

  const form =
    document.getElementById(
      "taskForm"
    );

  if (!form) return;

  form.reset();

  const date =
    document.getElementById(
      "taskDate"
    );

  if (date) {

    date.value =
      getLocalDateString();

  }

  const low =
    document.querySelector(
      'input[name="taskPriority"][value="low"]'
    );

  if (low) {

    low.checked = true;

  }

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  renderStatistics();

  renderTodayTasks();

  renderUpcomingTasks();

  renderAllTasks();

  renderCalendar();

  renderNotifications();

}


/* =========================================================
   STATISTICS
   ========================================================= */

function renderStatistics() {

  const total =
    tasks.length;

  const completed =
    tasks.filter(
      function (task) {

        return task.completed;

      }
    ).length;

  const pending =
    total - completed;

  const priority =
    tasks.filter(
      function (task) {

        return (
          task.priority === "high" &&
          !task.completed
        );

      }
    ).length;


  setText(
    "totalTaskCount",
    total
  );

  setText(
    "pendingTaskCount",
    pending
  );

  setText(
    "completedTaskCount",
    completed
  );

  setText(
    "priorityTaskCount",
    priority
  );

}


/* =========================================================
   TODAY TASKS
   ========================================================= */

function renderTodayTasks() {

  const container =
    document.getElementById(
      "todayTaskList"
    );

  if (!container) return;

  const today =
    getLocalDateString();

  const todayTasks =
    tasks
      .filter(
        function (task) {

          return (
            task.date === today
          );

        }
      )
      .sort(
        sortTasks
      );


  container.innerHTML = "";


  if (
    todayTasks.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

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
          class="primary-button"
          type="button"
          onclick="navigateTo('add')"
        >
          + Tambah Tugas
        </button>

      </div>

    `;

    return;

  }


  todayTasks.forEach(
    function (task) {

      container.appendChild(
        createTaskCard(
          task
        )
      );

    }
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

  if (!container) return;

  const today =
    getLocalDateString();


  const upcoming =
    tasks
      .filter(
        function (task) {

          return (
            task.date > today &&
            !task.completed
          );

        }
      )
      .sort(
        sortTasks
      )
      .slice(
        0,
        5
      );


  container.innerHTML = "";


  if (
    upcoming.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          🎉
        </div>

        <h3>
          Tidak ada tugas mendatang
        </h3>

        <p>
          Jadwalmu terlihat aman untuk sementara.
        </p>

      </div>

    `;

    return;

  }


  upcoming.forEach(
    function (task) {

      container.appendChild(
        createTaskCard(
          task
        )
      );

    }
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

  if (!container) return;


  let filtered =
    [...tasks];


  if (
    currentFilter === "pending"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return !task.completed;

        }
      );

  }


  if (
    currentFilter === "completed"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return task.completed;

        }
      );

  }


  if (
    currentFilter === "priority"
  ) {

    filtered =
      filtered.filter(
        function (task) {

          return (
            task.priority === "high"
          );

        }
      );

  }


  if (
    currentSearch
  ) {

    const query =
      currentSearch.toLowerCase();


    filtered =
      filtered.filter(
        function (task) {

          return (

            task.title
              .toLowerCase()
              .includes(query)

            ||

            task.description
              .toLowerCase()
              .includes(query)

            ||

            task.category
              .toLowerCase()
              .includes(query)

          );

        }
      );

  }


  filtered.sort(
    sortTasks
  );


  container.innerHTML = "";


  if (
    filtered.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          📋
        </div>

        <h3>
          Belum ada tugas
        </h3>

        <p>
          Tidak ada tugas yang cocok.
        </p>

      </div>

    `;

    return;

  }


  filtered.forEach(
    function (task) {

      container.appendChild(
        createTaskCard(
          task
        )
      );

    }
  );

}


/* =========================================================
   TASK CARD
   ========================================================= */

function createTaskCard(
  task
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "task-card" +
    (
      task.completed
        ? " completed"
        : ""
    );


  const categoryNames = {

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


  const priorityNames = {

    low:
      "Rendah",

    medium:
      "Sedang",

    high:
      "Tinggi"

  };


  card.innerHTML = `

    <div class="task-check">

      <button
        class="check-button"
        type="button"
        aria-label="Tandai tugas"
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
          📅 ${formatDate(task.date)}
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
            categoryNames[
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
            priorityNames[
              task.priority
            ] ||
            "Rendah"
          }
        </span>

        ${
          task.reminder
            ? `
              <span class="task-category">
                🔔 Pengingat
              </span>
            `
            : ""
        }

      </div>

    </div>


    <button
      class="task-more-button"
      type="button"
      aria-label="Detail tugas"
    >
      ⋮
    </button>

  `;


  const checkButton =
    card.querySelector(
      ".check-button"
    );

  checkButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      toggleTaskComplete(
        task.id
      );

    }
  );


  const moreButton =
    card.querySelector(
      ".task-more-button"
    );

  moreButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      openTaskModal(
        task.id
      );

    }
  );


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
   COMPLETE TASK
   ========================================================= */

function toggleTaskComplete(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return item.id === taskId;

      }
    );


  if (!task) return;


  task.completed =
    !task.completed;


  saveTasks();

  renderAll();


  showToast(

    task.completed
      ? "✓"
      : "↩️",

    task.completed
      ? "Tugas selesai!"
      : "Tugas dikembalikan."

  );

}


/* =========================================================
   TASK MODAL
   ========================================================= */

function openTaskModal(
  taskId
) {

  const task =
    tasks.find(
      function (item) {

        return item.id === taskId;

      }
    );


  if (!task) return;


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


  if (!modal || !content) {
    return;
  }


  content.innerHTML = `

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

    <br>

    <p>
      📅 <strong>Tanggal:</strong>
      ${formatDate(task.date)}
    </p>

    ${
      task.time
        ? `
          <p>
            ⏰ <strong>Waktu:</strong>
            ${task.time}
          </p>
        `
        : ""
    }

    <p>
      📌 <strong>Kategori:</strong>
      ${task.category}
    </p>

    <p>
      🔥 <strong>Prioritas:</strong>
      ${task.priority}
    </p>

    <p>
      ${
        task.completed
          ? "✅ Tugas sudah selesai."
          : "⏳ Tugas belum selesai."
      }
    </p>

  `;


  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );


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


function closeTaskModal() {

  const modal =
    document.getElementById(
      "taskModal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

  selectedTaskId =
    null;

}


/* =========================================================
   COMPLETE SELECTED
   ========================================================= */

function completeSelectedTask() {

  if (!selectedTaskId) {
    return;
  }


  const id =
    selectedTaskId;


  closeTaskModal();

  toggleTaskComplete(
    id
  );

}


/* =========================================================
   EDIT TASK
   ========================================================= */

function editSelectedTask() {

  if (!selectedTaskId) {
    return;
  }


  const task =
    tasks.find(
      function (item) {

        return item.id === selectedTaskId;

      }
    );


  if (!task) return;


  document.getElementById(
    "taskTitle"
  ).value =
    task.title;


  document.getElementById(
    "taskDescription"
  ).value =
    task.description;


  document.getElementById(
    "taskDate"
  ).value =
    task.date;


  document.getElementById(
    "taskTime"
  ).value =
    task.time;


  document.getElementById(
    "taskCategory"
  ).value =
    task.category;


  const priority =
    document.querySelector(
      `input[name="taskPriority"][value="${task.priority}"]`
    );


  if (priority) {

    priority.checked =
      true;

  }


  document.getElementById(
    "taskReminder"
  ).checked =
    task.reminder;


  tasks =
    tasks.filter(
      function (item) {

        return item.id !== task.id;

      }
    );


  saveTasks();

  closeTaskModal();

  navigateTo(
    "add"
  );


  showToast(
    "✏️",
    "Edit tugas lalu simpan kembali."
  );

}


/* =========================================================
   DELETE TASK
   ========================================================= */

function deleteSelectedTask() {

  if (!selectedTaskId) {
    return;
  }


  const confirmed =
    confirm(
      "Yakin ingin menghapus tugas ini?"
    );


  if (!confirmed) {
    return;
  }


  tasks =
    tasks.filter(
      function (task) {

        return task.id !== selectedTaskId;

      }
    );


  saveTasks();

  closeTaskModal();

  renderAll();


  showToast(
    "🗑️",
    "Tugas berhasil dihapus."
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const input =
    document.getElementById(
      "taskSearchInput"
    );

  const clear =
    document.getElementById(
      "clearSearchButton"
    );


  if (input) {

    input.addEventListener(
      "input",
      function () {

        currentSearch =
          input.value.trim();

        renderAllTasks();

      }
    );

  }


  if (clear) {

    clear.addEventListener(
      "click",
      function () {

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


          button.classList.add(
            "active"
          );


          currentFilter =
            button.dataset.filter;


          renderAllTasks();

        }
      );

    }
  );

}


/* =========================================================
   CALENDAR
   ========================================================= */

function setupCalendar() {

  const previous =
    document.getElementById(
      "previousMonthButton"
    );

  const next =
    document.getElementById(
      "nextMonthButton"
    );


  if (previous) {

    previous.addEventListener(
      "click",
      function () {

        currentCalendarDate.setMonth(
          currentCalendarDate.getMonth() - 1
        );

        renderCalendar();

      }
    );

  }


  if (next) {

    next.addEventListener(
      "click",
      function () {

        currentCalendarDate.setMonth(
          currentCalendarDate.getMonth() + 1
        );

        renderCalendar();

      }
    );

  }

}


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
    !daysContainer ||
    !monthTitle
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


  monthTitle.textContent =
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


  daysContainer.innerHTML =
    "";


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );

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
      formatDateForInput(
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


    button.textContent =
      day;


    if (
      dateString ===
      getLocalDateString()
    ) {

      button.classList.add(
        "today"
      );

    }


    if (
      tasks.some(
        function (task) {

          return (
            task.date ===
            dateString
          );

        }
      )
    ) {

      button.classList.add(
        "has-task"
      );

    }


    button.addEventListener(
      "click",
      function () {

        selectedCalendarDate =
          date;

        renderSelectedDateTasks();

      }
    );


    daysContainer.appendChild(
      button
    );

  }


  renderSelectedDateTasks();

}


/* =========================================================
   SELECTED CALENDAR DATE
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


  if (!container) {
    return;
  }


  const dateString =
    formatDateForInput(
      selectedCalendarDate
    );


  const selectedTasks =
    tasks
      .filter(
        function (task) {

          return (
            task.date ===
            dateString
          );

        }
      )
      .sort(
        sortTasks
      );


  if (title) {

    title.textContent =
      formatDate(
        dateString
      );

  }


  container.innerHTML =
    "";


  if (
    selectedTasks.length === 0
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
    function (task) {

      container.appendChild(
        createTaskCard(
          task
        )
      );

    }
  );

}


/* =========================================================
   PROFILE
   ========================================================= */

function setupProfile() {

  const saveButton =
    document.getElementById(
      "saveProfileButton"
    );


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveProfile
    );

  }


  /*
     UPLOAD FOTO PROFIL
     Dibuat otomatis jika belum
     ada input upload di HTML.
  */

  const avatar =
    document.querySelector(
      ".large-profile-avatar"
    );


  if (
    avatar &&
    !document.getElementById(
      "profilePhotoInput"
    )
  ) {

    const input =
      document.createElement(
        "input"
      );

    input.type =
      "file";

    input.id =
      "profilePhotoInput";

    input.accept =
      "image/*";

    input.style.display =
      "none";


    document.body.appendChild(
      input
    );


    avatar.style.cursor =
      "pointer";


    avatar.title =
      "Klik untuk mengganti foto profil";


    avatar.addEventListener(
      "click",
      function () {

        input.click();

      }
    );


    input.addEventListener(
      "change",
      handleProfilePhoto
    );

  }

}


function saveProfile() {

  const input =
    document.getElementById(
      "userName"
    );


  const name =
    input
      ? input.value.trim()
      : "";


  const oldProfile =
    JSON.parse(
      localStorage.getItem(
        PROFILE_KEY
      ) ||
      "{}"
    );


  const profile = {

    name:
      name ||
      "Pengguna TaskTime",

    photo:
      oldProfile.photo ||
      ""

  };


  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(
      profile
    )
  );


  updateProfileUI(
    profile.name,
    profile.photo
  );


  showToast(
    "✓",
    "Profil berhasil disimpan."
  );

}


function handleProfilePhoto(
  event
) {

  const file =
    event.target.files[0];


  if (!file) {
    return;
  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    showToast(
      "⚠️",
      "File harus berupa gambar."
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function (e) {

      const photo =
        e.target.result;


      const oldProfile =
        JSON.parse(
          localStorage.getItem(
            PROFILE_KEY
          ) ||
          "{}"
        );


      const profile = {

        name:
          oldProfile.name ||
          "Pengguna TaskTime",

        photo:
          photo

      };


      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(
          profile
        )
      );


      updateProfileUI(
        profile.name,
        profile.photo
      );


      showToast(
        "📷",
        "Foto profil berhasil diubah."
      );

    };


  reader.readAsDataURL(
    file
  );

}


function updateProfileUI(
  name,
  photo
) {

  const saved =
    JSON.parse(
      localStorage.getItem(
        PROFILE_KEY
      ) ||
      "{}"
    );


  name =
    name ||
    saved.name ||
    "Pengguna TaskTime";


  photo =
    photo ||
    saved.photo ||
    "";


  const initial =
    name
      .charAt(0)
      .toUpperCase();


  setText(
    "profileNameDisplay",
    name
  );


  setText(
    "profileEmailDisplay",
    "Selamat datang di TaskTime"
  );


  setText(
    "profileInitial",
    initial
  );


  setText(
    "largeProfileInitial",
    initial
  );


  const avatar =
    document.querySelector(
      ".large-profile-avatar"
    );


  if (avatar) {

    if (photo) {

      avatar.style.backgroundImage =
        `url("${photo}")`;

      avatar.style.backgroundSize =
        "cover";

      avatar.style.backgroundPosition =
        "center";


      const text =
        document.getElementById(
          "largeProfileInitial"
        );


      if (text) {

        text.style.display =
          "none";

      }

    } else {

      avatar.style.backgroundImage =
        "";

      const text =
        document.getElementById(
          "largeProfileInitial"
        );


      if (text) {

        text.style.display =
          "block";

      }

    }

  }


  const profileButton =
    document.getElementById(
      "profileButton"
    );


  if (profileButton) {

    if (photo) {

      profileButton.style.backgroundImage =
        `url("${photo}")`;

      profileButton.style.backgroundSize =
        "cover";

      profileButton.style.backgroundPosition =
        "center";


      const initialElement =
        document.getElementById(
          "profileInitial"
        );


      if (initialElement) {

        initialElement.style.display =
          "none";

      }

    } else {

      profileButton.style.backgroundImage =
        "";

      const initialElement =
        document.getElementById(
          "profileInitial"
        );


      if (initialElement) {

        initialElement.style.display =
          "block";

      }

    }

  }

}


/* =========================================================
   NOTIFICATION SETUP
   ========================================================= */

function setupNotifications() {

  /*
    Tidak langsung menampilkan
    "Browser tidak mendukung".

    Tombol akan mencoba Firebase
    Messaging + Service Worker.
  */

  updateNotificationButton();

}


/* =========================================================
   ENABLE FIREBASE NOTIFICATIONS
   ========================================================= */

async function enableNotifications() {

  try {

    showToast(
      "⏳",
      "Mengaktifkan notifikasi..."
    );


    /*
      Pastikan Firebase sudah dimuat
    */

    if (
      !window.taskTimeFirebase
    ) {

      showToast(
        "❌",
        "Firebase belum siap. Tunggu sebentar lalu coba lagi."
      );

      return;

    }


    /*
      Cek Service Worker
    */

    if (
      !("serviceWorker" in navigator)
    ) {

      showToast(
        "❌",
        "Service Worker tidak tersedia di aplikasi ini."
      );

      return;

    }


    /*
      Register Firebase Messaging SW
    */

    const registration =
      await navigator.serviceWorker.register(
        "./firebase-messaging-sw.js"
      );


    console.log(
      "Firebase Messaging Service Worker:",
      registration.scope
    );


    /*
      Tunggu Service Worker aktif
    */

    await navigator.serviceWorker.ready;


    /*
      Permission

      Jika Notification API tersedia,
      minta izin.

      Jika tidak tersedia,
      tetap lanjut mencoba FCM.
    */

    let permission =
      "default";


    if (
      "Notification" in window
    ) {

      permission =
        await Notification.requestPermission();


      console.log(
        "Notification permission:",
        permission
      );


      if (
        permission ===
        "denied"
      ) {

        showToast(
          "❌",
          "Notifikasi ditolak. Aktifkan izin notifikasi TaskTime di pengaturan HP."
        );

        return;

      }

    } else {

      console.warn(
        "Notification API tidak tersedia. Melanjutkan melalui Firebase Messaging."
      );

    }


    /*
      Ambil Firebase Messaging
    */

    const messaging =
      window
        .taskTimeFirebase
        .messaging;


    const getToken =
      window
        .taskTimeFirebase
        .getToken;


    const VAPID_KEY =
      window
        .taskTimeFirebase
        .VAPID_KEY;


    if (
      !messaging ||
      !getToken ||
      !VAPID_KEY
    ) {

      showToast(
        "❌",
        "Konfigurasi Firebase Messaging belum lengkap."
      );

      return;

    }


    /*
      Ambil FCM TOKEN
    */

    const token =
      await getToken(
        messaging,
        {

          vapidKey:
            VAPID_KEY,

          serviceWorkerRegistration:
            registration

        }
      );


    if (!token) {

      showToast(
        "⚠️",
        "FCM Token belum tersedia. Coba aktifkan lagi."
      );

      return;

    }


    console.log(
      "================================="
    );

    console.log(
      "TASKTIME FCM TOKEN:"
    );

    console.log(
      token
    );

    console.log(
      "================================="
    );


    /*
      Simpan token
    */

    localStorage.setItem(
      FCM_TOKEN_KEY,
      token
    );


    localStorage.setItem(
      NOTIFICATION_ENABLED_KEY,
      "true"
    );


    /*
      Update tombol
    */

    updateNotificationButton();


    /*
      Tambahkan notifikasi lokal
    */

    addNotification(
      "Notifikasi Aktif",
      "TaskTime siap menerima pengingat tugas."
    );


    showToast(
      "🔔",
      "Notifikasi berhasil diaktifkan!"
    );


  } catch (error) {

    console.error(
      "ERROR NOTIFIKASI:",
      error
    );


    let message =
      "Gagal mengaktifkan notifikasi.";


    if (
      error.code ===
      "messaging/permission-blocked"
    ) {

      message =
        "Izin notifikasi diblokir. Aktifkan dari pengaturan aplikasi.";

    }


    if (
      error.code ===
      "messaging/failed-service-worker-registration"
    ) {

      message =
        "Firebase Messaging Service Worker gagal dijalankan.";

    }


    if (
      error.code ===
      "messaging/unsupported-browser"
    ) {

      message =
        "Firebase Messaging tidak didukung oleh browser/PWA ini.";

    }


    showToast(
      "❌",
      message
    );

  }

}


/* =========================================================
   UPDATE NOTIFICATION BUTTON
   ========================================================= */

function updateNotificationButton() {

  const button =
    document.getElementById(
      "enableNotificationButton"
    );


  if (!button) {
    return;
  }


  const enabled =
    localStorage.getItem(
      NOTIFICATION_ENABLED_KEY
    );


  if (
    enabled ===
    "true"
  ) {

    button.textContent =
      "✓ Aktif";


    button.disabled =
      false;


    button.title =
      "Notifikasi sudah diaktifkan";

  } else {

    button.textContent =
      "Aktifkan";


    button.disabled =
      false;


    button.title =
      "Aktifkan notifikasi TaskTime";

  }

}


/* =========================================================
   ADD NOTIFICATION
   ========================================================= */

function addNotification(
  title,
  body
) {

  notifications.unshift({

    id:
      Date.now().toString(),

    title:
      title,

    body:
      body,

    date:
      getLocalDateString(),

    time:
      new Date()
        .toTimeString()
        .slice(
          0,
          5
        ),

    read:
      false

  });


  notifications =
    notifications.slice(
      0,
      50
    );


  saveNotifications();

  renderNotifications();

}


/* =========================================================
   RENDER NOTIFICATIONS
   ========================================================= */

function renderNotifications() {

  const list =
    document.getElementById(
      "notificationList"
    );

  const badge =
    document.getElementById(
      "notificationBadge"
    );


  if (!list) {
    return;
  }


  const unread =
    notifications.filter(
      function (item) {

        return !item.read;

      }
    ).length;


  if (badge) {

    badge.textContent =
      unread > 99
        ? "99+"
        : unread;

    badge.style.display =
      unread > 0
        ? "flex"
        : "none";

  }


  if (
    notifications.length === 0
  ) {

    list.innerHTML = `

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


  list.innerHTML =
    "";


  notifications.forEach(
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
              "TaskTime"
            )}
          </strong>

          <p>
            ${escapeHTML(
              notification.body ||
              ""
            )}
          </p>

          <small>
            ${
              notification.date ||
              ""
            }
            ${
              notification.time ||
              ""
            }
          </small>

        </div>

      `;


      list.appendChild(
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


  if (!panel) {
    return;
  }


  panel.classList.toggle(
    "hidden"
  );


  if (
    !panel.classList.contains(
      "hidden"
    )
  ) {

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

    renderNotifications();

  }

}


function closeNotificationPanel() {

  const panel =
    document.getElementById(
      "notificationPanel"
    );


  if (panel) {

    panel.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout =
  null;


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
    !toast
  ) {

    alert(
      message
    );

    return;

  }


  if (toastIcon) {

    toastIcon.textContent =
      icon;

  }


  if (toastMessage) {

    toastMessage.textContent =
      message;

  }


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimeout
  );


  toastTimeout =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


window.showToast =
  showToast;


/* =========================================================
   PWA INSTALL
   ========================================================= */

function setupPWAInstall() {

  window.addEventListener(
    "beforeinstallprompt",
    function (event) {

      event.preventDefault();

      deferredInstallPrompt =
        event;


      const button =
        document.getElement
