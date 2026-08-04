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

let toastTimeout = null;

let reminderInterval = null;


/* =========================================================
   LOCAL STORAGE KEYS
   ========================================================= */

const TASKS_KEY =
  "taskTimeTasks";

const NOTIFICATIONS_KEY =
  "taskTimeNotifications";

const PROFILE_KEY =
  "taskTimeProfile";

const FCM_TOKEN_KEY =
  "taskTimeFCMToken";

const NOTIFICATION_ENABLED_KEY =
  "taskTimeNotificationEnabled";


/* =========================================================
   INITIALIZE APPLICATION
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

    setupImportButton();

    setupVisibilityHandler();

    setupKeyboardShortcuts();

    updateGreeting();

    updateTodayDate();

    renderAll();

    updateConnectionStatus();

    updateNotificationButton();

    startReminderChecker();

    registerServiceWorker();

    setupFirebaseForegroundMessage();


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
        ? JSON.parse(
            savedTasks
          )
        : [];


    notifications =
      savedNotifications
        ? JSON.parse(
            savedNotifications
          )
        : [];


    if (
      !Array.isArray(tasks)
    ) {

      tasks = [];

    }


    if (
      !Array.isArray(
        notifications
      )
    ) {

      notifications = [];

    }


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
   SAVE TASKS
   ========================================================= */

function saveTasks() {

  try {

    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify(
        tasks
      )
    );

  } catch (error) {

    console.error(
      "Gagal menyimpan tugas:",
      error
    );

  }

}


/* =========================================================
   SAVE NOTIFICATIONS
   ========================================================= */

function saveNotifications() {

  try {

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(
        notifications
      )
    );

  } catch (error) {

    console.error(
      "Gagal menyimpan notifikasi:",
      error
    );

  }

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
      `.page[data-page="${pageName}"]`
    );


  if (
    targetPage
  ) {

    targetPage.classList.add(
      "active"
    );

  }


  const activeNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );


  if (
    activeNav
  ) {

    activeNav.classList.add(
      "active"
    );

  }


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


  if (
    pageName ===
    "profile"
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


  if (
    quickAdd
  ) {

    quickAdd.addEventListener(
      "click",
      function () {

        resetTaskForm();

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


  if (
    emptyAdd
  ) {

    emptyAdd.addEventListener(
      "click",
      function () {

        resetTaskForm();

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


  if (
    bottomAdd
  ) {

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


  if (
    tasksAdd
  ) {

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


  if (
    viewAll
  ) {

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


  const notificationButton =
    document.getElementById(
      "notificationButton"
    );


  if (
    notificationButton
  ) {

    notificationButton.addEventListener(
      "click",
      toggleNotificationPanel
    );

  }


  const closeNotification =
    document.getElementById(
      "closeNotificationPanel"
    );


  if (
    closeNotification
  ) {

    closeNotification.addEventListener(
      "click",
      closeNotificationPanel
    );

  }


  const closeModal =
    document.getElementById(
      "closeTaskModal"
    );


  if (
    closeModal
  ) {

    closeModal.addEventListener(
      "click",
      closeTaskModal
    );

  }


  const modalOverlay =
    document.querySelector(
      ".modal-overlay"
    );


  if (
    modalOverlay
  ) {

    modalOverlay.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modalOverlay
        ) {

          closeTaskModal();

        }

      }
    );

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
      completeSelectedTask
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
      editSelectedTask
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
      deleteSelectedTask
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


  const notificationEnable =
    document.getElementById(
      "enableNotificationButton"
    );


  if (
    notificationEnable
  ) {

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


  if (
    !form
  ) {

    return;

  }


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


  if (
    resetButton
  ) {

    resetButton.addEventListener(
      "click",
      function () {

        setTimeout(
          function () {

            const date =
              document.getElementById(
                "taskDate"
              );


            if (
              date
            ) {

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


/* =========================================================
   ADD TASK
   ========================================================= */

function addTask() {

  const titleElement =
    document.getElementById(
      "taskTitle"
    );


  const descriptionElement =
    document.getElementById(
      "taskDescription"
    );


  const dateElement =
    document.getElementById(
      "taskDate"
    );


  const timeElement =
    document.getElementById(
      "taskTime"
    );


  const categoryElement =
    document.getElementById(
      "taskCategory"
    );


  const reminderElement =
    document.getElementById(
      "taskReminder"
    );


  if (
    !titleElement ||
    !dateElement
  ) {

    return;

  }


  const title =
    titleElement.value.trim();


  const description =
    descriptionElement
      ? descriptionElement.value.trim()
      : "";


  const date =
    dateElement.value;


  const time =
    timeElement
      ? timeElement.value
      : "";


  const category =
    categoryElement
      ? categoryElement.value
      : "lainnya";


  const priorityElement =
    document.querySelector(
      'input[name="taskPriority"]:checked'
    );


  const priority =
    priorityElement
      ? priorityElement.value
      : "low";


  const reminder =
    reminderElement
      ? reminderElement.checked
      : false;


  if (
    !title
  ) {

    showToast(
      "⚠️",
      "Masukkan nama tugas."
    );

    return;

  }


  if (
    !date
  ) {

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
   RESET TASK FORM
   ========================================================= */

function resetTaskForm() {

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


  const date =
    document.getElementById(
      "taskDate"
    );


  if (
    date
  ) {

    date.value =
      getLocalDateString();

  }


  const low =
    document.querySelector(
      'input[name="taskPriority"][value="low"]'
    );


  if (
    low
  ) {

    low.checked =
      true;

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


  if (
    !container
  ) {

    return;

  }


  const today =
    getLocalDateString();


  const todayTasks =
    tasks
      .filter(
        function (task) {

          return (
            task.date ===
            today
          );

        }
      )
      .sort(
        sortTasks
      );


  container.innerHTML =
    "";


  if (
    todayTasks.length ===
    0
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


  if (
    !container
  ) {

    return;

  }


  const today =
    getLocalDateString();


  const upcoming =
    tasks
      .filter(
        function (task) {

          return (
            task.date >
              today &&
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


  container.innerHTML =
    "";


  if (
    upcoming.length ===
    0
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

          return !task.completed;

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

          return task.completed;

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

    const query =
      currentSearch.toLowerCase();


    filtered =
      filtered.filter(
        function (task) {

          return (

            String(
              task.title ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              )

            ||

            String(
              task.description ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              )

            ||

            String(
              task.category ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              )

          );

        }
      );

  }


  filtered.sort(
    sortTasks
  );


  container.innerHTML =
    "";


  if (
    filtered.length ===
    0
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
          📅 ${formatDate(
            task.date
          )}
        </span>

        ${
          task.time
            ? `
              <span>
                ⏰ ${escapeHTML(
                  task.time
                )}
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
            priority-${escapeHTML(
              task.priority
            )}
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


  if (
    checkButton
  ) {

    checkButton.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        toggleTaskComplete(
          task.id
        );

      }
    );

  }


  const moreButton =
    card.querySelector(
      ".task-more-button"
    );


  if (
    moreButton
  ) {

    moreButton.addEventListener(
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
   TOGGLE COMPLETE
   ========================================================= */

function toggleTaskComplete(
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

    <br>

    <p>
      📅 <strong>Tanggal:</strong>
      ${formatDate(
        task.date
      )}
    </p>

    ${
      task.time
        ? `
          <p>
            ⏰ <strong>Waktu:</strong>
            ${escapeHTML(
              task.time
            )}
          </p>
        `
        : ""
    }

    <p>
      📌 <strong>Kategori:</strong>
      ${escapeHTML(
        task.category
      )}
    </p>

    <p>
      🔥 <strong>Prioritas:</strong>
      ${escapeHTML(
        task.priority
      )}
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


  if (
    completeButton
  ) {

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


  if (
    modal
  ) {

    modal.classList.add(
      "hidden"
    );

  }


  selectedTaskId =
    null;

}


/* =========================================================
   COMPLETE SELECTED TASK
   ========================================================= */

function completeSelectedTask() {

  if (
    !selectedTaskId
  ) {

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

  if (
    !selectedTaskId
  ) {

    return;

  }


  const task =
    tasks.find(
      function (item) {

        return (
          item.id ===
          selectedTaskId
        );

      }
    );


  if (
    !task
  ) {

    return;

  }


  const title =
    document.getElementById(
      "taskTitle"
    );


  const description =
    document.getElementById(
      "taskDescription"
    );


  const date =
    document.getElementById(
      "taskDate"
    );


  const time =
    document.getElementById(
      "taskTime"
    );


  const category =
    document.getElementById(
      "taskCategory"
    );


  const reminder =
    document.getElementById(
      "taskReminder"
    );


  if (
    title
  ) {

    title.value =
      task.title;

  }


  if (
    description
  ) {

    description.value =
      task.description ||
      "";

  }


  if (
    date
  ) {

    date.value =
      task.date;

  }


  if (
    time
  ) {

    time.value =
      task.time ||
      "";

  }


  if (
    category
  ) {

    category.value =
      task.category ||
      "lainnya";

  }


  const priority =
    document.querySelector(
      `input[name="taskPriority"][value="${task.priority}"]`
    );


  if (
    priority
  ) {

    priority.checked =
      true;

  }


  if (
    reminder
  ) {

    reminder.checked =
      !!task.reminder;

  }


  tasks =
    tasks.filter(
      function (item) {

        return (
          item.id !==
          task.id
        );

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

  if (
    !selectedTaskId
  ) {

    return;

  }


  const confirmed =
    confirm(
      "Yakin ingin menghapus tugas ini?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  tasks =
    tasks.filter(
      function (task) {

        return (
          task.id !==
          selectedTaskId
        );

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


  if (
    input
  ) {

    input.addEventListener(
      "input",
      function () {

        currentSearch =
          input.value.trim();


        renderAllTasks();

      }
    );

  }


  if (
    clear
  ) {

    clear.addEventListener(
      "click",
      function () {

        if (
          input
        ) {

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
        month:
          "long",

        year:
          "numeric"
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


    if (
      dateString ===
      formatDateForInput(
        selectedCalendarDate
      )
    ) {

      button.classList.add(
        "selected"
      );

    }


    button.addEventListener(
      "click",
      function () {

        selectedCalendarDate =
          date;


        renderCalendar();

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


  if (
    !container
  ) {

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


  if (
    title
  ) {

    title.textContent =
      formatDate(
        dateString
      );

  }


  container.innerHTML =
    "";


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


  if (
    saveButton
  ) {

    saveButton.addEventListener(
      "click",
      saveProfile
    );

  }


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


/* =========================================================
   SAVE PROFILE
   ========================================================= */

function saveProfile() {

  const input =
    document.getElementById(
      "userName"
    );


  const name =
    input
      ? input.value.trim()
      : "";


  let oldProfile =
    {};


  try {

    oldProfile =
      JSON.parse(
        localStorage.getItem(
          PROFILE_KEY
        ) ||
        "{}"
      );

  } catch (error) {

    oldProfile =
      {};

  }


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


/* =========================================================
   PROFILE PHOTO
   ========================================================= */

function handleProfilePhoto(
  event
) {

  const file =
    event.target.files[0];


  if (
    !file
  ) {

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


      let oldProfile =
        {};


      try {

        oldProfile =
          JSON.parse(
            localStorage.getItem(
              PROFILE_KEY
            ) ||
            "{}"
          );

      } catch (error) {

        oldProfile =
          {};

      }


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


/* =========================================================
   UPDATE PROFILE UI
   ========================================================= */

function updateProfileUI(
  name,
  photo
) {

  let saved =
    {};


  try {

    saved =
      JSON.parse(
        localStorage.getItem(
          PROFILE_KEY
        ) ||
        "{}"
      );

  } catch (error) {

    saved =
      {};

  }


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


  if (
    avatar
  ) {

    if (
      photo
    ) {

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


      if (
        text
      ) {

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


      if (
        text
      ) {

        text.style.display =
          "block";

      }

    }

  }


  const profileButton =
    document.getElementById(
      "profileButton"
    );


  if (
    profileButton
  ) {

    if (
      photo
    ) {

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


      if (
        initialElement
      ) {

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


      if (
        initialElement
      ) {

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

  updateNotificationButton();

}


/* =========================================================
   ENABLE NOTIFICATIONS
   ========================================================= */

async function enableNotifications() {

  try {

    showToast(
      "⏳",
      "Mengaktifkan notifikasi..."
    );


    if (
      !window.taskTimeFirebase
    ) {

      showToast(
        "❌",
        "Firebase belum siap. Periksa konfigurasi Firebase."
      );

      return;

    }


    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {

      showToast(
        "❌",
        "Service Worker tidak tersedia."
      );

      return;

    }


    const registration =
      await navigator.serviceWorker.register(
        "./firebase-messaging-sw.js"
      );


    await navigator.serviceWorker.ready;


    let permission =
      "default";


    if (
      "Notification" in
      window
    ) {

      permission =
        await Notification.requestPermission();


      if (
        permission ===
        "denied"
      ) {

        showToast(
          "❌",
          "Izin notifikasi ditolak. Aktifkan izin dari pengaturan HP."
        );

        return;

      }

    }


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


    if (
      !token
    ) {

      showToast(
        "⚠️",
        "FCM Token belum tersedia."
      );

      return;

    }


    console.log(
      "TASKTIME FCM TOKEN:"
    );


    console.log(
      token
    );


    localStorage.setItem(
      FCM_TOKEN_KEY,
      token
    );


    localStorage.setItem(
      NOTIFICATION_ENABLED_KEY,
      "true"
    );


    updateNotificationButton();


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
        "Firebase Messaging tidak didukung browser ini.";

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


  if (
    !button
  ) {

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


  if (
    !list
  ) {

    return;

  }


  const unread =
    notifications.filter(
      function (item) {

        return !item.read;

      }
    ).length;


  if (
    badge
  ) {

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
    notifications.length ===
    0
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
    function (
      notification
    ) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "notification-item" +
        (
          notification.read
            ? ""
            : " unread"
        );


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


  if (
    !panel
  ) {

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


  if (
    panel
  ) {

    panel.classList.add(
      "hidden"
    );

  }

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
    !toast
  ) {

    console.log(
      message
    );

    return;

  }


  if (
    toastIcon
  ) {

    toastIcon.textContent =
      icon;

  }


  if (
    toastMessage
  ) {

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
        document.getElementById(
          "installAppButton"
        );


      if (
        button
      ) {

        button.style.display =
          "block";

      }

    }
  );


  window.addEventListener(
    "appinstalled",
    function () {

      deferredInstallPrompt =
        null;


      const button =
        document.getElementById(
          "installAppButton"
        );


      if (
        button
      ) {

        button.style.display =
          "none";

      }


      addNotification(
        "TaskTime Terpasang",
        "TaskTime berhasil dipasang sebagai aplikasi."
      );


      showToast(
        "📱",
        "TaskTime berhasil dipasang!"
      );

    }
  );


  const button =
    document.getElementById(
      "installAppButton"
    );


  if (
    button
  ) {

    button.addEventListener(
      "click",
      installPWA
    );


    if (
      !deferredInstallPrompt
    ) {

      button.style.display =
        "none";

    }

  }

}


async function installPWA() {

  if (
    !deferredInstallPrompt
  ) {

    showToast(
      "ℹ️",
      "Aplikasi belum tersedia untuk diinstal."
    );

    return;

  }


  deferredInstallPrompt.prompt();


  const result =
    await deferredInstallPrompt.userChoice;


  console.log(
    "Install result:",
    result.outcome
  );


  deferredInstallPrompt =
    null;


  const button =
    document.getElementById(
      "installAppButton"
    );


  if (
    button
  ) {

    button.style.display =
      "none";

  }

}


window.installPWA =
  installPWA;


/* =========================================================
   GREETING
   ========================================================= */

function updateGreeting() {

  const greeting =
    document.getElementById(
      "greetingText"
    );


  if (
    !greeting
  ) {

    return;

  }


  const hour =
    new Date().getHours();


  let text =
    "Selamat pagi";


  if (
    hour >= 12 &&
    hour < 15
  ) {

    text =
      "Selamat siang";

  }


  else if (
    hour >= 15 &&
    hour < 18
  ) {

    text =
      "Selamat sore";

  }


  else if (
    hour >= 18 ||
    hour < 5
  ) {

    text =
      "Selamat malam";

  }


  greeting.textContent =
    text;

}


/* =========================================================
   TODAY DATE
   ========================================================= */

function updateTodayDate() {

  const element =
    document.getElementById(
      "todayDate"
    );


  if (
    !element
  ) {

    return;

  }


  element.textContent =
    new Date()
      .toLocaleDateString(
        "id-ID",
        {

          weekday:
            "long",

          day:
            "numeric",

          month:
            "long",

          year:
            "numeric"

        }
      );

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function updateConnectionStatus() {

  const status =
    document.getElementById(
      "connectionStatus"
    );


  if (
    !status
  ) {

    return;

  }


  function update() {

    if (
      navigator.onLine
    ) {

      status.textContent =
        "Online";


      status.classList.remove(
        "offline"
      );


      status.classList.add(
        "online"
      );

    } else {

      status.textContent =
        "Offline";


      status.classList.remove(
        "online"
      );


      status.classList.add(
        "offline"
      );

    }

  }


  update();


  window.addEventListener(
    "online",
    function () {

      update();


      showToast(
        "🌐",
        "Koneksi internet kembali."
      );

    }
  );


  window.addEventListener(
    "offline",
    function () {

      update();


      showToast(
        "📡",
        "Offline. TaskTime tetap bisa digunakan."
      );

    }
  );

}


/* =========================================================
   SORT TASKS
   ========================================================= */

function sortTasks(
  a,
  b
) {

  if (
    a.completed !==
    b.completed
  ) {

    return a.completed
      ? 1
      : -1;

  }


  const dateA =
    a.date ||
    "";


  const dateB =
    b.date ||
    "";


  if (
    dateA !==
    dateB
  ) {

    return dateA.localeCompare(
      dateB
    );

  }


  const timeA =
    a.time ||
    "23:59";


  const timeB =
    b.time ||
    "23:59";


  return timeA.localeCompare(
    timeB
  );

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getLocalDateString() {

  return formatDateForInput(
    new Date()
  );

}


function formatDateForInput(
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
    year +
    "-" +
    month +
    "-" +
    day
  );

}


function formatDate(
  dateString
) {

  if (
    !dateString
  ) {

    return "-";

  }


  const parts =
    dateString.split(
      "-"
    );


  if (
    parts.length !==
    3
  ) {

    return dateString;

  }


  const date =
    new Date(
      Number(
        parts[0]
      ),
      Number(
        parts[1]
      ) - 1,
      Number(
        parts[2]
      )
    );


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return dateString;

  }


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


/* =========================================================
   TEXT HELPER
   ========================================================= */

function setText(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (
    element
  ) {

    element.textContent =
      value;

  }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
  value
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    return "";

  }


  return String(
    value
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   CLEAR ALL DATA
   ========================================================= */

function clearAllData() {

  const confirmed =
    confirm(
      "Yakin ingin menghapus semua data TaskTime?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  const doubleConfirmed =
    confirm(
      "Data tugas, notifikasi, dan profil akan dihapus. Lanjutkan?"
    );


  if (
    !doubleConfirmed
  ) {

    return;

  }


  tasks =
    [];


  notifications =
    [];


  localStorage.removeItem(
    TASKS_KEY
  );


  localStorage.removeItem(
    NOTIFICATIONS_KEY
  );


  localStorage.removeItem(
    PROFILE_KEY
  );


  localStorage.removeItem(
    FCM_TOKEN_KEY
  );


  localStorage.removeItem(
    NOTIFICATION_ENABLED_KEY
  );


  updateProfileUI(
    "Pengguna TaskTime",
    ""
  );


  const userName =
    document.getElementById(
      "userName"
    );


  if (
    userName
  ) {

    userName.value =
      "";

  }


  renderAll();

  updateNotificationButton();


  showToast(
    "🗑️",
    "Semua data berhasil dihapus."
  );

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

    tasks:
      tasks,

    notifications:
      notifications,

    profile:
      JSON.parse(
        localStorage.getItem(
          PROFILE_KEY
        ) ||
        "{}"
      )

  };


  const json =
    JSON.stringify(
      data,
      null,
      2
    );


  const blob =
    new Blob(
      [json],
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
    "tasktime-backup-" +
    getLocalDateString() +
    ".json";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "📦",
    "Data berhasil diekspor."
  );

}


/* =========================================================
   IMPORT DATA
   ========================================================= */

function importDataFile(
  file
) {

  if (
    !file
  ) {

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    function (event) {

      try {

        const data =
          JSON.parse(
            event.target.result
          );


        if (
          !data ||
          typeof data !==
            "object"
        ) {

          throw new Error(
            "Format tidak valid"
          );

        }


        if (
          Array.isArray(
            data.tasks
          )
        ) {

          tasks =
            data.tasks;


          saveTasks();

        }


        if (
          Array.isArray(
            data.notifications
          )
        ) {

          notifications =
            data.notifications;


          saveNotifications();

        }


        if (
          data.profile &&
          typeof data.profile ===
            "object"
        ) {

          localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(
              data.profile
            )
          );

        }


        renderAll();

        updateProfileUI();


        showToast(
          "✅",
          "Data berhasil dipulihkan."
        );

      } catch (error) {

        console.error(
          "Import error:",
          error
        );


        showToast(
          "❌",
          "File backup tidak valid."
        );

      }

    };


  reader.readAsText(
    file
  );

}


/* =========================================================
   IMPORT BUTTON
   ========================================================= */

function setupImportButton() {

  const exportButton =
    document.getElementById(
      "exportDataButton"
    );


  if (
    !exportButton ||
    document.getElementById(
      "importDataButton"
    )
  ) {

    return;

  }


  const importButton =
    document.createElement(
      "button"
    );


  importButton.id =
    "importDataButton";


  importButton.type =
    "button";


  importButton.className =
    exportButton.className;


  importButton.textContent =
    "📥 Impor Data";


  if (
    exportButton.parentNode
  ) {

    exportButton.parentNode.appendChild(
      importButton
    );

  }


  const input =
    document.createElement(
      "input"
    );


  input.type =
    "file";


  input.accept =
    ".json,application/json";


  input.style.display =
    "none";


  document.body.appendChild(
    input
  );


  importButton.addEventListener(
    "click",
    function () {

      input.click();

    }
  );


  input.addEventListener(
    "change",
    function () {

      const file =
        input.files[0];


      if (
        file
      ) {

        importDataFile(
          file
        );

      }


      input.value =
        "";

    }
  );

}


/* =========================================================
   TASK REMINDER CHECKER
   ========================================================= */

function checkTaskReminders() {

  const now =
    new Date();


  const today =
    getLocalDateString();


  const currentTime =
    now
      .toTimeString()
      .slice(
        0,
        5
      );


  tasks.forEach(
    function (task) {

      if (
        task.completed ||
        !task.reminder ||
        task.date !==
          today ||
        !task.time
      ) {

        return;

      }


      const reminderKey =
        "taskTimeReminder_" +
        task.id +
        "_" +
        task.date +
        "_" +
        task.time;


      if (
        localStorage.getItem(
          reminderKey
        )
      ) {

        return;

      }


      if (
        task.time ===
        currentTime
      ) {

        localStorage.setItem(
          reminderKey,
          "true"
        );


        addNotification(
          "Pengingat Tugas",
          "Waktunya mengerjakan: " +
            task.title
        );


        showToast(
          "🔔",
          "Pengingat: " +
            task.title
        );


        if (
          "Notification" in
            window &&
          Notification.permission ===
            "granted"
        ) {

          try {

            new Notification(
              "TaskTime — Pengingat Tugas",
              {

                body:
                  task.title,

                icon:
                  "./icons/icon-192.png",

                badge:
                  "./icons/icon-192.png"

              }
            );

          } catch (error) {

            console.error(
              "Notification error:",
              error
            );

          }

        }

      }

    }
  );

}


/* =========================================================
   START REMINDER CHECKER
   ========================================================= */

function startReminderChecker() {

  checkTaskReminders();


  if (
    reminderInterval
  ) {

    clearInterval(
      reminderInterval
    );

  }


  reminderInterval =
    setInterval(
      checkTaskReminders,
      30000
    );

}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {

    console.warn(
      "Service Worker tidak didukung."
    );

    return;

  }


  window.addEventListener(
    "load",
    async function () {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "./service-worker.js"
          );


        console.log(
          "Service Worker berhasil:",
          registration.scope
        );


      } catch (error) {

        console.error(
          "Service Worker gagal:",
          error
        );

      }

    }
  );

}


/* =========================================================
   FIREBASE FOREGROUND MESSAGE
   ========================================================= */

function setupFirebaseForegroundMessage() {

  if (
    !window.taskTimeFirebase
  ) {

    return;

  }


  const messaging =
    window
      .taskTimeFirebase
      .messaging;


  const onMessage =
    window
      .taskTimeFirebase
      .onMessage;


  if (
    !messaging ||
    typeof onMessage !==
      "function"
  ) {

    return;

  }


  onMessage(
    messaging,
    function (payload) {

      console.log(
        "Firebase message:",
        payload
      );


      const notification =
        payload.notification ||
        {};


      const title =
        notification.title ||
        "TaskTime";


      const body =
        notification.body ||
        "Kamu memiliki pengingat baru.";


      addNotification(
        title,
        body
      );


      showToast(
        "🔔",
        body
      );

    }
  );

}


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

function setupVisibilityHandler() {

  document.addEventListener(
    "visibilitychange",
    function () {

      if (
        !document.hidden
      ) {

        renderAll();

        updateGreeting();

        updateTodayDate();

        checkTaskReminders();

      }

    }
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() ===
          "k"
      ) {

        const search =
          document.getElementById(
            "taskSearchInput"
          );


        if (
          search
        ) {

          event.preventDefault();

          search.focus();

        }

      }


      if (
        event.key ===
        "Escape"
      ) {

        closeTaskModal();

        closeNotificationPanel();

      }

    }
  );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.navigateTo =
  navigateTo;


window.openTaskModal =
  openTaskModal;


window.closeTaskModal =
  closeTaskModal;


window.toggleTaskComplete =
  toggleTaskComplete;


window.addTask =
  addTask;


window.resetTaskForm =
  resetTaskForm;


window.renderAll =
  renderAll;


window.formatDate =
  formatDate;


window.clearAllData =
  clearAllData;


window.exportData =
  exportData;


window.importDataFile =
  importDataFile;


/* =========================================================
   TASKTIME READY
   ========================================================= */

console.log(
  "================================="
);

console.log(
  "TASKTIME APP READY"
);

console.log(
  "Version: 1.0.0"
);

console.log(
  "Offline PWA: Ready"
);

console.log(
  "LocalStorage: Ready"
);

console.log(
  "Firebase Messaging: Ready"
);

console.log(
  "================================="
);
