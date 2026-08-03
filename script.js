/* =========================================================
   TASKTIME — SCRIPT.JS FULL FINAL
   =========================================================
   Fitur:
   - Navigasi halaman
   - Tambah tugas
   - Edit tugas
   - Hapus tugas
   - Tandai selesai
   - Prioritas
   - Pencarian
   - Filter
   - Kalender
   - Profil
   - Upload foto profil
   - Export data
   - Hapus semua data
   - Notifikasi browser/PWA
   - Firebase Cloud Messaging
   - Service Worker
   - Penyimpanan LocalStorage
   ========================================================= */


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

const TASK_STORAGE_KEY = "tasktime_tasks";
const NOTIFICATION_STORAGE_KEY = "tasktime_notifications";
const PROFILE_STORAGE_KEY = "tasktime_profile";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  console.log("TaskTime sedang dimuat...");

  loadTasks();
  loadNotifications();
  loadProfile();

  setupNavigation();
  setupTaskForm();
  setupTaskButtons();
  setupSearch();
  setupFilters();
  setupCalendar();
  setupProfile();
  setupNotifications();
  setupInstall();

  setTodayDate();
  updateGreeting();
  updateAllUI();

  setupNotificationButton();

  setTimeout(function () {

    const loadingScreen =
      document.getElementById("loadingScreen");

    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
    }

  }, 500);

  console.log("TaskTime berhasil dimuat.");

});


/* =========================================================
   LOCAL STORAGE — TASKS
   ========================================================= */

function loadTasks() {

  try {

    const savedTasks =
      localStorage.getItem(TASK_STORAGE_KEY);

    if (savedTasks) {

      tasks = JSON.parse(savedTasks);

    } else {

      tasks = [];

    }

  } catch (error) {

    console.error(
      "Gagal memuat tugas:",
      error
    );

    tasks = [];

  }

}


function saveTasks() {

  try {

    localStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify(tasks)
    );

  } catch (error) {

    console.error(
      "Gagal menyimpan tugas:",
      error
    );

  }

}


/* =========================================================
   LOCAL STORAGE — NOTIFICATIONS
   ========================================================= */

function loadNotifications() {

  try {

    const saved =
      localStorage.getItem(
        NOTIFICATION_STORAGE_KEY
      );

    if (saved) {

      notifications =
        JSON.parse(saved);

    } else {

      notifications = [];

    }

  } catch (error) {

    console.error(
      "Gagal memuat notifikasi:",
      error
    );

    notifications = [];

  }

}


function saveNotifications() {

  try {

    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications)
    );

  } catch (error) {

    console.error(
      "Gagal menyimpan notifikasi:",
      error
    );

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

function loadProfile() {

  try {

    const profile =
      JSON.parse(
        localStorage.getItem(
          PROFILE_STORAGE_KEY
        )
      );

    if (!profile) {
      return;
    }

    const name =
      profile.name || "";

    const photo =
      profile.photo || "";

    const userName =
      document.getElementById(
        "userName"
      );

    if (userName) {

      userName.value = name;

    }

    updateProfileDisplay(
      name,
      photo
    );

  } catch (error) {

    console.error(
      "Gagal memuat profil:",
      error
    );

  }

}


function saveProfile() {

  const input =
    document.getElementById(
      "userName"
    );

  const name =
    input ?
    input.value.trim() :
    "";

  let oldProfile = {};

  try {

    oldProfile =
      JSON.parse(
        localStorage.getItem(
          PROFILE_STORAGE_KEY
        )
      ) || {};

  } catch (error) {

    oldProfile = {};

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
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );

  updateProfileDisplay(
    profile.name,
    profile.photo
  );

  showToast(
    "✓",
    "Profil berhasil disimpan"
  );

}


function updateProfileDisplay(
  name,
  photo
) {

  const displayName =
    name ||
    "Pengguna TaskTime";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  const profileNameDisplay =
    document.getElementById(
      "profileNameDisplay"
    );

  const profileInitial =
    document.getElementById(
      "profileInitial"
    );

  const largeProfileInitial =
    document.getElementById(
      "largeProfileInitial"
    );

  const profileAvatar =
    document.querySelector(
      ".large-profile-avatar"
    );

  const headerAvatar =
    document.querySelector(
      ".profile-button"
    );


  if (profileNameDisplay) {

    profileNameDisplay.textContent =
      displayName;

  }


  if (profileInitial) {

    profileInitial.textContent =
      initial;

  }


  if (largeProfileInitial) {

    largeProfileInitial.textContent =
      initial;

  }


  if (photo) {

    if (profileAvatar) {

      profileAvatar.innerHTML = "";

      const img =
        document.createElement(
          "img"
        );

      img.src = photo;

      img.alt =
        "Foto profil";

      img.style.width =
        "100%";

      img.style.height =
        "100%";

      img.style.objectFit =
        "cover";

      img.style.borderRadius =
        "50%";

      profileAvatar.appendChild(
        img
      );

    }


    if (headerAvatar) {

      headerAvatar.innerHTML = "";

      const img =
        document.createElement(
          "img"
        );

      img.src = photo;

      img.alt =
        "Foto profil";

      img.style.width =
        "100%";

      img.style.height =
        "100%";

      img.style.objectFit =
        "cover";

      headerAvatar.appendChild(
        img
      );

    }

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
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const page =
            button.dataset.page;

          if (page) {

            navigateToPage(
              page
            );

          }

        }
      );

    }
  );


  const bottomAddButton =
    document.getElementById(
      "bottomAddButton"
    );

  if (bottomAddButton) {

    bottomAddButton.addEventListener(
      "click",
      function () {

        navigateToPage(
          "add"
        );

      }
    );

  }


  const quickAddButton =
    document.getElementById(
      "quickAddButton"
    );

  if (quickAddButton) {

    quickAddButton.addEventListener(
      "click",
      function () {

        navigateToPage(
          "add"
        );

      }
    );

  }


  const emptyAddTaskButton =
    document.getElementById(
      "emptyAddTaskButton"
    );

  if (emptyAddTaskButton) {

    emptyAddTaskButton.addEventListener(
      "click",
      function () {

        navigateToPage(
          "add"
        );

      }
    );

  }


  const addTaskFromTasksPage =
    document.getElementById(
      "addTaskFromTasksPage"
    );

  if (addTaskFromTasksPage) {

    addTaskFromTasksPage.addEventListener(
      "click",
      function () {

        navigateToPage(
          "add"
        );

      }
    );

  }


  const viewAllTasksButton =
    document.getElementById(
      "viewAllTasksButton"
    );

  if (viewAllTasksButton) {

    viewAllTasksButton.addEventListener(
      "click",
      function () {

        navigateToPage(
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

        navigateToPage(
          "profile"
        );

      }
    );

  }

}


function navigateToPage(
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
    document.querySelector(
      `[data-page="${pageName}"]`
    );


  if (targetPage) {

    targetPage.classList.add(
      "active"
    );

  }


  const navItems =
    document.querySelectorAll(
      ".nav-item"
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


  window.scrollTo(
    {
      top: 0,
      behavior: "smooth"
    }
  );


  if (
    pageName ===
    "calendar"
  ) {

    renderCalendar();

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

  if (!form) {
    return;
  }


  const dateInput =
    document.getElementById(
      "taskDate"
    );

  if (dateInput) {

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


  form.addEventListener(
    "reset",
    function () {

      setTimeout(
        function () {

          if (dateInput) {

            dateInput.value =
              getLocalDateString();

          }

        },
        0
      );

    }
  );

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

  const priorityInput =
    document.querySelector(
      'input[name="taskPriority"]:checked'
    );

  const priority =
    priorityInput ?
    priorityInput.value :
    "low";

  const reminder =
    document.getElementById(
      "taskReminder"
    ).checked;


  if (!title) {

    showToast(
      "⚠️",
      "Nama tugas wajib diisi"
    );

    return;

  }


  if (!date) {

    showToast(
      "⚠️",
      "Tanggal tugas wajib diisi"
    );

    return;

  }


  const task = {

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
    task
  );

  saveTasks();

  updateAllUI();

  showToast(
    "✓",
    "Tugas berhasil ditambahkan"
  );


  document
    .getElementById(
      "taskForm"
    )
    .reset();


  document
    .getElementById(
      "taskDate"
    )
    .value =
    getLocalDateString();


  navigateToPage(
    "home"
  );

}


/* =========================================================
   TASK BUTTONS
   ========================================================= */

function setupTaskButtons() {

  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );

  const editButton =
    document.getElementById(
      "editTaskButton"
    );

  const deleteButton =
    document.getElementById(
      "deleteTaskButton"
    );

  const closeButton =
    document.getElementById(
      "closeTaskModal"
    );

  const overlay =
    document.querySelector(
      ".modal-overlay"
    );


  if (completeButton) {

    completeButton.addEventListener(
      "click",
      function () {

        if (
          selectedTaskId
        ) {

          toggleTask(
            selectedTaskId
          );

          closeTaskModal();

        }

      }
    );

  }


  if (editButton) {

    editButton.addEventListener(
      "click",
      function () {

        if (
          selectedTaskId
        ) {

          editTask(
            selectedTaskId
          );

        }

      }
    );

  }


  if (deleteButton) {

    deleteButton.addEventListener(
      "click",
      function () {

        if (
          selectedTaskId
        ) {

          deleteTask(
            selectedTaskId
          );

        }

      }
    );

  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeTaskModal
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeTaskModal
    );

  }

}


/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTaskCard(
  task
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "task-card" +
    (
      task.completed ?
      " completed" :
      ""
    );


  const checkContainer =
    document.createElement(
      "div"
    );

  checkContainer.className =
    "task-check";


  const checkButton =
    document.createElement(
      "button"
    );

  checkButton.className =
    "check-button";

  checkButton.type =
    "button";

  checkButton.innerHTML =
    task.completed ?
    "✓" :
    "";


  checkButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();

      toggleTask(
        task.id
      );

    }
  );


  checkContainer.appendChild(
    checkButton
  );


  const content =
    document.createElement(
      "div"
    );

  content.className =
    "task-content";


  const title =
    document.createElement(
      "h3"
    );

  title.textContent =
    task.title;


  const description =
    document.createElement(
      "p"
    );

  description.textContent =
    task.description ||
    "Tidak ada deskripsi";


  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "task-meta";


  const dateSpan =
    document.createElement(
      "span"
    );

  dateSpan.textContent =
    "📅 " +
    formatDate(
      task.date
    );


  meta.appendChild(
    dateSpan
  );


  if (task.time) {

    const timeSpan =
      document.createElement(
        "span"
      );

    timeSpan.textContent =
      "⏰ " +
      task.time;

    meta.appendChild(
      timeSpan
    );

  }


  const tags =
    document.createElement(
      "div"
    );

  tags.className =
    "task-tags";


  const category =
    document.createElement(
      "span"
    );

  category.className =
    "task-category";

  category.textContent =
    getCategoryLabel(
      task.category
    );


  const priority =
    document.createElement(
      "span"
    );

  priority.className =
    "task-priority " +
    "priority-" +
    task.priority;

  priority.textContent =
    getPriorityLabel(
      task.priority
    );


  tags.appendChild(
    category
  );

  tags.appendChild(
    priority
  );


  if (task.reminder) {

    const reminder =
      document.createElement(
        "span"
      );

    reminder.className =
      "task-category";

    reminder.textContent =
      "🔔 Pengingat";

    tags.appendChild(
      reminder
    );

  }


  content.appendChild(
    title
  );

  content.appendChild(
    description
  );

  content.appendChild(
    meta
  );

  content.appendChild(
    tags
  );


  const moreButton =
    document.createElement(
      "button"
    );

  moreButton.className =
    "task-more-button";

  moreButton.type =
    "button";

  moreButton.textContent =
    "⋮";


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


  card.appendChild(
    checkContainer
  );

  card.appendChild(
    content
  );

  card.appendChild(
    moreButton
  );


  return card;

}


/* =========================================================
   HOME TASKS
   ========================================================= */

function renderTodayTasks() {

  const container =
    document.getElementById(
      "todayTaskList"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


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
          id="dynamicEmptyAdd"
        >
          + Tambah Tugas
        </button>

      </div>

    `;


    const button =
      document.getElementById(
        "dynamicEmptyAdd"
      );

    if (button) {

      button.addEventListener(
        "click",
        function () {

          navigateToPage(
            "add"
          );

        }
      );

    }


    return;

  }


  todayTasks.forEach(
    function (task) {

      container.appendChild(
        renderTaskCard(
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

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


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
          Semua tugasmu aman untuk sekarang.
        </p>

      </div>

    `;

    return;

  }


  upcoming.forEach(
    function (task) {

      container.appendChild(
        renderTaskCard(
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

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


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

    const search =
      currentSearch.toLowerCase();


    filtered =
      filtered.filter(
        function (task) {

          return (

            task.title
              .toLowerCase()
              .includes(
                search
              )

            ||

            task.description
              .toLowerCase()
              .includes(
                search
              )

          );

        }
      );

  }


  filtered.sort(
    sortTasks
  );


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
          Tidak ada tugas
        </h3>

        <p>
          Tidak ada tugas yang cocok dengan filter.
        </p>

      </div>

    `;

    return;

  }


  filtered.forEach(
    function (task) {

      container.appendChild(
        renderTaskCard(
          task
        )
      );

    }
  );

}


/* =========================================================
   TOGGLE TASK
   ========================================================= */

function toggleTask(
  id
) {

  const task =
    tasks.find(
      function (item) {

        return item.id === id;

      }
    );


  if (!task) {
    return;
  }


  task.completed =
    !task.completed;


  saveTasks();

  updateAllUI();


  showToast(

    task.completed ?
    "✓" :
    "↩️",

    task.completed ?
    "Tugas selesai!" :
    "Tugas dikembalikan"

  );

}


/* =========================================================
   DELETE TASK
   ========================================================= */

function deleteTask(
  id
) {

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

        return task.id !== id;

      }
    );


  saveTasks();

  closeTaskModal();

  updateAllUI();


  showToast(
    "🗑️",
    "Tugas berhasil dihapus"
  );

}


/* =========================================================
   EDIT TASK
   ========================================================= */

function editTask(
  id
) {

  const task =
    tasks.find(
      function (item) {

        return item.id === id;

      }
    );


  if (!task) {
    return;
  }


  closeTaskModal();

  navigateToPage(
    "add"
  );


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


  const form =
    document.getElementById(
      "taskForm"
    );


  const originalSubmit =
    form.onsubmit;


  form.onsubmit =
    function (event) {

      event.preventDefault();


      task.title =
        document.getElementById(
          "taskTitle"
        ).value.trim();


      task.description =
        document.getElementById(
          "taskDescription"
        ).value.trim();


      task.date =
        document.getElementById(
          "taskDate"
        ).value;


      task.time =
        document.getElementById(
          "taskTime"
        ).value;


      task.category =
        document.getElementById(
          "taskCategory"
        ).value;


      const selectedPriority =
        document.querySelector(
          'input[name="taskPriority"]:checked'
        );


      task.priority =
        selectedPriority ?
        selectedPriority.value :
        "low";


      task.reminder =
        document.getElementById(
          "taskReminder"
        ).checked;


      saveTasks();

      updateAllUI();


      showToast(
        "✓",
        "Tugas berhasil diperbarui"
      );


      form.reset();

      document.getElementById(
        "taskDate"
      ).value =
        getLocalDateString();


      form.onsubmit =
        originalSubmit;


      navigateToPage(
        "tasks"
      );

    };

}


/* =========================================================
   TASK MODAL
   ========================================================= */

function openTaskModal(
  id
) {

  const task =
    tasks.find(
      function (item) {

        return item.id === id;

      }
    );


  if (!task) {
    return;
  }


  selectedTaskId =
    id;


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

    <h3 style="color:white;margin-bottom:10px;">
      ${escapeHTML(task.title)}
    </h3>

    <p>
      ${escapeHTML(
        task.description ||
        "Tidak ada deskripsi."
      )}
    </p>

    <div style="margin-top:15px;">

      <strong style="color:white;">
        📅 Tanggal:
      </strong>

      ${formatDate(task.date)}

    </div>

    <div style="margin-top:7px;">

      <strong style="color:white;">
        ⏰ Waktu:
      </strong>

      ${task.time || "Tidak ditentukan"}

    </div>

    <div style="margin-top:7px;">

      <strong style="color:white;">
        📌 Kategori:
      </strong>

      ${getCategoryLabel(task.category)}

    </div>

    <div style="margin-top:7px;">

      <strong style="color:white;">
        🔥 Prioritas:
      </strong>

      ${getPriorityLabel(task.priority)}

    </div>

    <div style="margin-top:7px;">

      <strong style="color:white;">
        Status:
      </strong>

      ${
        task.completed ?
        "✅ Selesai" :
        "⏳ Belum selesai"
      }

    </div>

  `;


  const completeButton =
    document.getElementById(
      "completeTaskButton"
    );


  if (completeButton) {

    completeButton.textContent =
      task.completed ?
      "↩️ Tandai Belum Selesai" :
      "✓ Tandai Selesai";

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
            button.dataset.filter ||
            "all";


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
          currentCalendarDate.getMonth() -
          1
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
          currentCalendarDate.getMonth() +
          1
        );

        renderCalendar();

      }
    );

  }


  renderCalendar();

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


  daysContainer.innerHTML =
    "";


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
      month
    ).toLocaleDateString(
      "id-ID",
      {
        month:
          "long",

        year:
          "numeric"
      }
    );


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


    const dateString =
      formatDateString(
        year,
        month,
        day
      );


    if (
      dateString ===
      getLocalDateString()
    ) {

      button.classList.add(
        "today"
      );

    }


    const hasTask =
      tasks.some(
        function (task) {

          return (
            task.date ===
            dateString
          );

        }
      );


    if (hasTask) {

      button.classList.add(
        "has-task"
      );

    }


    button.addEventListener(
      "click",
      function () {

        selectedCalendarDate =
          new Date(
            year,
            month,
            day
          );

        renderSelectedDateTasks();

      }
    );


    daysContainer.appendChild(
      button
    );

  }


  renderSelectedDateTasks();

}


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
    !container ||
    !title
  ) {

    return;

  }


  const date =
    formatDateString(
      selectedCalendarDate.getFullYear(),
      selectedCalendarDate.getMonth(),
      selectedCalendarDate.getDate()
    );


  title.textContent =
    formatDate(
      date
    );


  container.innerHTML =
    "";


  const selectedTasks =
    tasks.filter(
      function (task) {

        return (
          task.date ===
          date
        );

      }
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


  selectedTasks
    .sort(sortTasks)
    .forEach(
      function (task) {

        container.appendChild(
          renderTaskCard(
            task
          )
        );

      }
    );

}


/* =========================================================
   NOTIFICATION UI
   ========================================================= */

function setupNotifications() {

  const enableButton =
    document.getElementById(
      "enableNotificationButton"
    );


  if (enableButton) {

    enableButton.addEventListener(
      "click",
      enableNotifications
    );

  }


  renderNotifications();

}


function setupNotificationButton() {

  const button =
    document.getElementById(
      "notificationButton"
    );


  const panel =
    document.getElementById(
      "notificationPanel"
    );


  const close =
    document.getElementById(
      "closeNotificationPanel"
    );


  if (
    button &&
    panel
  ) {

    button.addEventListener(
      "click",
      function () {

        panel.classList.toggle(
          "hidden"
        );

        renderNotifications();

      }
    );

  }


  if (
    close &&
    panel
  ) {

    close.addEventListener(
      "click",
      function () {

        panel.classList.add(
          "hidden"
        );

      }
    );

  }

}


/* =========================================================
   ENABLE NOTIFICATIONS
   ========================================================= */

async function enableNotifications() {

  console.log(
    "Memulai aktivasi notifikasi..."
  );


  /*
    Jangan hanya mengecek userAgent.
    PWA yang sudah di-install tetap menggunakan
    Notification API dari browser engine.
  */


  if (
    !("Notification" in window)
  ) {

    showToast(
      "⚠️",
      "Notifikasi tidak tersedia di perangkat ini."
    );

    return;

  }


  if (
    !("serviceWorker" in navigator)
  ) {

    showToast(
      "⚠️",
      "Service Worker tidak tersedia."
    );

    return;

  }


  try {

    const permission =
      await Notification.requestPermission();


    console.log(
      "Permission:",
      permission
    );


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


    /*
      Ambil Service Worker Firebase.
      File ini harus berada di root website:
      
      /firebase-messaging-sw.js
    */

    const registration =
      await navigator.serviceWorker.ready;


    console.log(
      "Service Worker siap:",
      registration
    );


    /*
      Firebase Messaging berasal dari
      window.taskTimeFirebase
      yang dibuat oleh index.html
    */

    if (
      !window.taskTimeFirebase
    ) {

      showToast(
        "⚠️",
        "Firebase belum selesai dimuat. Coba lagi."
      );

      return;

    }


    const messaging =
      window.taskTimeFirebase.messaging;


    const getToken =
      window.taskTimeFirebase.getToken;


    const VAPID_KEY =
      window.taskTimeFirebase.VAPID_KEY;


    if (
      !messaging ||
      !getToken ||
      !VAPID_KEY
    ) {

      showToast(
        "⚠️",
        "Konfigurasi Firebase belum lengkap."
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


    if (token) {

      console.log(
        "FCM TOKEN:",
        token
      );


      localStorage.setItem(
        "tasktime_fcm_token",
        token
      );


      showToast(
        "🔔",
        "Notifikasi berhasil diaktifkan!"
      );


      addNotification(
        "Notifikasi Aktif",
        "TaskTime sekarang dapat menerima notifikasi."
      );


      updateNotificationButton(
        true
      );


    } else {

      showToast(
        "⚠️",
        "Token notifikasi tidak berhasil dibuat."
      );

    }


  } catch (error) {

    console.error(
      "Gagal mengaktifkan notifikasi:",
      error
    );


    /*
      Error khusus permission
    */

    if (
      error.code ===
      "messaging/permission-blocked"
    ) {

      showToast(
        "⚠️",
        "Notifikasi diblokir. Aktifkan izin notifikasi TaskTime di pengaturan aplikasi."
      );

      return;

    }


    showToast(
      "⚠️",
      "Notifikasi gagal diaktifkan: " +
      error.message
    );

  }

}


/* =========================================================
   UPDATE NOTIFICATION BUTTON
   ========================================================= */

function updateNotificationButton(
  enabled
) {

  const button =
    document.getElementById(
      "enableNotificationButton"
    );


  if (!button) {
    return;
  }


  if (enabled) {

    button.textContent =
      "✓ Aktif";

    button.disabled =
      false;

  } else {

    button.textContent =
      "Aktifkan";

  }

}


/* =========================================================
   ADD NOTIFICATION
   ========================================================= */

function addNotification(
  title,
  body
) {

  const notification = {

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

  };


  notifications.unshift(
    notification
  );


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

  const container =
    document.getElementById(
      "notificationList"
    );


  const badge =
    document.getElementById(
      "notificationBadge"
    );


  if (!container) {
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
      unread;

    badge.style.display =
      unread > 0 ?
      "flex" :
      "none";

  }


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
    "";


  notifications.forEach(
    function (item) {

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "notification-item";


      element.innerHTML = `

        <span>
          🔔
        </span>

        <div>

          <strong>
            ${escapeHTML(
              item.title ||
              "Notifikasi"
            )}
          </strong>

          <small>
            ${escapeHTML(
              item.body ||
              ""
            )}
            <br>
            ${item.date || ""}
            ${item.time || ""}
          </small>

        </div>

      `;


      element.addEventListener(
        "click",
        function () {

          item.read =
            true;

          saveNotifications();

          renderNotifications();

        }
      );


      container.appendChild(
        element
      );

    }
  );

}


/* =========================================================
   FIREBASE MESSAGE
   ========================================================= */

window.handleFirebaseMessage =
  function (
    payload
  ) {

    console.log(
      "Firebase message:",
      payload
    );


    const notification =
      payload.notification ||
      payload.data ||
      {};


    const title =
      notification.title ||
      "TaskTime 🔔";


    const body =
      notification.body ||
      "Kamu memiliki pengingat tugas.";


    addNotification(
      title,
      body
    );


    showToast(
      "🔔",
      body
    );

  };


/* =========================================================
   PROFILE SETUP
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
    Buat input upload foto profil
    secara otomatis jika belum ada.
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

    const uploadButton =
      document.createElement(
        "button"
      );


    uploadButton.type =
      "button";

    uploadButton.className =
      "secondary-button full";

    uploadButton.style.marginTop =
      "12px";

    uploadButton.textContent =
      "📷 Ganti Foto Profil";


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


    uploadButton.addEventListener(
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
          function (event) {

            let profile = {};

            try {

              profile =
                JSON.parse(
                  localStorage.getItem(
                    PROFILE_STORAGE_KEY
                  )
                ) || {};

            } catch (error) {

              profile = {};

            }


            profile.photo =
              event.target.result;


            localStorage.setItem(
              PROFILE_STORAGE_KEY,
              JSON.stringify(
                profile
              )
            );


            updateProfileDisplay(
              profile.name ||
              "Pengguna TaskTime",
              profile.photo
            );


            showToast(
              "📷",
              "Foto profil berhasil diperbarui."
            );

          };


        reader.readAsDataURL(
          file
        );

      }
    );


    const profileSection =
      document.querySelector(
        ".settings-section"
      );


    if (profileSection) {

      profileSection.appendChild(
        input
      );

      profileSection.appendChild(
        uploadButton
      );

    }

  }

}


/* =========================================================
   EXPORT DATA
   ========================================================= */

function setupDataButtons() {

  const exportButton =
    document.getElementById(
      "exportDataButton"
    );


  const clearButton =
    document.getElementById(
      "clearDataButton"
    );


  if (exportButton) {

    exportButton.addEventListener(
      "click",
      exportData
    );

  }


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearAllData
    );

  }

}


function exportData() {

  const data = {

    tasks:
      tasks,

    notifications:
      notifications,

    profile:
      JSON.parse(
        localStorage.getItem(
          PROFILE_STORAGE_KEY
        )
      ) || {}

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


  link.click();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "📤",
    "Data berhasil diekspor."
  );

}


function clearAllData() {

  const confirmed =
    confirm(
      "Yakin ingin menghapus SEMUA data TaskTime?"
    );


  if (!confirmed) {
    return;
  }


  localStorage.removeItem(
    TASK_STORAGE_KEY
  );

  localStorage.removeItem(
    NOTIFICATION_STORAGE_KEY
  );

  localStorage.removeItem(
    PROFILE_STORAGE_KEY
  );


  tasks = [];

  notifications = [];


  updateAllUI();


  showToast(
    "🗑️",
    "Semua data berhasil dihapus."
  );

}


/* =========================================================
   SETUP DATA BUTTONS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  setupDataButtons
);


/* =========================================================
   INSTALL PWA
   ========================================================= */

function setupInstall() {

  const installButton =
    document.getElementById(
      "installAppButton"
    );


  window.addEventListener(
    "beforeinstallprompt",
    function (event) {

      event.preventDefault();

      deferredInstallPrompt =
        event;


      if (installButton) {

        installButton.classList.add(
          "show"
        );

        installButton.style.display =
          "flex";

      }

    }
  );


  if (installButton) {

    installButton.addEventListener(
      "click",
      async function () {

        if (
          !deferredInstallPrompt
        ) {

          showToast(
            "ℹ️",
            "Aplikasi sudah terpasang atau browser belum menyediakan instalasi."
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


        installButton.style.display =
          "none";

      }
    );

  }

}


/* =========================================================
   GREETING
   ========================================================= */

function updateGreeting() {

  const greeting =
    document.getElementById(
      "currentGreeting"
    );


  if (!greeting) {
    return;
  }


  const hour =
    new Date().getHours();


  let text =
    "Selamat datang 👋";


  if (
    hour >= 5 &&
    hour < 12
  ) {

    text =
      "Selamat pagi ☀️";

  } else if (
    hour >= 12 &&
    hour < 18
  ) {

    text =
      "Selamat siang 🌤️";

  } else {

    text =
      "Selamat malam 🌙";

  }


  greeting.textContent =
    text;

}


/* =========================================================
   TODAY DATE
   ========================================================= */

function setTodayDate() {

  const element =
    document.getElementById(
      "todayDate"
    );


  if (!element) {
    return;
  }


  element.textContent =
    new Date().toLocaleDateString(
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
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

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


function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================================
   UPDATE ALL UI
   ========================================================= */

function updateAllUI() {

  updateStatistics();

  renderTodayTasks();

  renderUpcomingTasks();

  renderAllTasks();

  renderCalendar();

  renderNotifications();

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;


window.showToast =
  function (
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

  };


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function getLocalDateString() {

  const date =
    new Date();


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


function formatDateString(
  year,
  month,
  day
) {

  return (

    year +
    "-" +

    String(
      month + 1
    ).padStart(
      2,
      "0"
    ) +

    "-" +

    String(
      day
    ).padStart(
      2,
      "0"
    )

  );

}


function formatDate(
  dateString
) {

  if (!dateString) {

    return "-";

  }


  const date =
    new Date(
      dateString +
      "T00:00:00"
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
        "short",

      year:
        "numeric"
    }
  );

}


function sortTasks(
  a,
  b
) {

  const dateA =
    (
      a.date ||
      ""
    ) +
    (
      a.time ||
      "23:59"
    );


  const dateB =
    (
      b.date ||
      ""
    ) +
    (
      b.time ||
      "23:59"
    );


  return dateA.localeCompare(
    dateB
  );

}


function getCategoryLabel(
  category
) {

  const categories = {

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


  return (
    categories[category] ||
    "📌 Lainnya"
  );

}


function getPriorityLabel(
  priority
) {

  const priorities = {

    low:
      "🟢 Rendah",

    medium:
      "🟡 Sedang",

    high:
      "🔴 Tinggi"

  };


  return (
    priorities[priority] ||
    "🟢 Rendah"
  );

}


function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* =========================================================
   AUTO REMINDER CHECK
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
        task.reminder &&
        !task.completed &&
        task.date === today &&
        task.time === currentTime
      ) {

        const reminderKey =
          "tasktime_reminder_" +
          task.id +
          "_" +
          today +
          "_" +
          currentTime;


        if (
          !localStorage.getItem(
            reminderKey
          )
        ) {

          localStorage.setItem(
            reminderKey,
            "true"
          );


          showLocalNotification(
            task.title,
            "Saatnya mengerjakan tugasmu."
          );


          addNotification(
            "Pengingat Tugas",
            task.title
          );

        }

      }

    }
  );

}


setInterval(
  checkTaskReminders,
  30000
);


/* =========================================================
   LOCAL NOTIFICATION
   ========================================================= */

async function showLocalNotification(
  title,
  body
) {

  if (
    !("Notification" in window)
  ) {

    return;

  }


  if (
    Notification.permission !==
    "granted"
  ) {

    return;

  }


  try {

    const registration =
      await navigator.serviceWorker.ready;


    await registration.showNotification(
      title,
      {
        body:
          body,

        icon:
          "./icon-192.png",

        badge:
          "./icon-192.png",

        vibrate:
          [
            200,
            100,
            200
          ],

        data:
          {
            url:
              "./"
          }
      }
    );

  } catch (error) {

    console.error(
      "Gagal menampilkan notifikasi:",
      error
    );

  }

}


/* =========================================================
   ONLINE / OFFLINE
   ========================================================= */

function updateConnectionStatus() {

  const indicator =
    document.getElementById(
      "offlineIndicator"
    );


  if (!indicator) {
    return;
  }


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
  updateConnectionStatus
);


window.addEventListener(
  "offline",
  updateConnectionStatus
);


updateConnectionStatus();


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    async function () {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "./service-worker.js"
          );


        console.log(
          "Service Worker aktif:",
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
   FIREBASE MESSAGE LISTENER
   ========================================================= */

window.addEventListener(
  "load",
  function () {

    setTimeout(
      function () {

        if (
          !window.taskTimeFirebase
        ) {

          console.warn(
            "Firebase belum tersedia."
          );

          return;

        }


        const messaging =
          window.taskTimeFirebase.messaging;


        const onMessage =
          window.taskTimeFirebase.onMessage;


        if (
          messaging &&
          onMessage
        ) {

          onMessage(
            messaging,
            function (payload) {

              console.log(
                "Pesan Firebase diterima:",
                payload
              );


              window.handleFirebaseMessage(
                payload
              );

            }
          );

        }

      },
      1000
    );

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

console.log(
  "TaskTime Script.js siap digunakan."
);
