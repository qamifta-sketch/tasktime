// ===============================
// TASKTIME - SCRIPT.JS
// ===============================

// Ambil elemen HTML
const taskList = document.getElementById("taskList");
const taskName = document.getElementById("taskName");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");

// Data tugas
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ===============================
// TAMPILKAN TUGAS
// ===============================
function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <p class="empty">
                Belum ada tugas.
            </p>
        `;
        return;
    }

    tasks.forEach((task, index) => {
        const taskItem = document.createElement("div");

        taskItem.className = "task-item";

        taskItem.innerHTML = `
            <div class="task-info">
                <h3>${task.name}</h3>
                <p>📅 ${task.date || "Tidak ada tanggal"}</p>
                <p>⭐ Prioritas: ${task.priority}</p>
            </div>

            <div class="task-actions">
                <button onclick="completeTask(${index})">
                    ${task.completed ? "↩️" : "✅"}
                </button>

                <button onclick="deleteTask(${index})">
                    🗑️
                </button>
            </div>
        `;

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        taskList.appendChild(taskItem);
    });
}

// ===============================
// TAMBAH TUGAS
// ===============================
function addTask() {
    if (!taskName) return;

    const name = taskName.value.trim();

    if (name === "") {
        alert("Masukkan nama tugas terlebih dahulu!");
        return;
    }

    const newTask = {
        name: name,
        date: taskDate ? taskDate.value : "",
        priority: taskPriority ? taskPriority.value : "Sedang",
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    // Kosongkan input
    taskName.value = "";

    if (taskDate) {
        taskDate.value = "";
    }

    alert("Tugas berhasil ditambahkan! 🎉");
}

// ===============================
// HAPUS TUGAS
// ===============================
function deleteTask(index) {
    if (confirm("Yakin ingin menghapus tugas ini?")) {
        tasks.splice(index, 1);

        saveTasks();
        renderTasks();
    }
}

// ===============================
// SELESAIKAN TUGAS
// ===============================
function completeTask(index) {
    tasks[index].completed = !tasks[index].completed;

    saveTasks();
    renderTasks();
}

// ===============================
// SIMPAN DATA
// ===============================
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===============================
// FITUR PENGINGAT
// ===============================
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Browser kamu tidak mendukung notifikasi.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification("TaskTime 🔔", {
            body: "Notifikasi sudah aktif!"
        });

        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("TaskTime 🔔", {
                body: "Notifikasi berhasil diaktifkan!"
            });
        } else {
            alert("Izin notifikasi ditolak.");
        }
    });
}

// ===============================
// CEK TUGAS HARI INI
// ===============================
function checkTodayTasks() {
    const today = new Date().toISOString().split("T")[0];

    const todayTasks = tasks.filter(task => {
        return task.date === today && !task.completed;
    });

    if (todayTasks.length > 0) {
        console.log(
            `Kamu punya ${todayTasks.length} tugas hari ini.`
        );
    }
}

// ===============================
// PENGINGAT TUGAS
// ===============================
function checkReminders() {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    const today = new Date().toISOString().split("T")[0];

    tasks.forEach(task => {
        if (
            task.date === today &&
            !task.completed &&
            !task.reminded
        ) {
            new Notification("Pengingat TaskTime 🔔", {
                body: `Jangan lupa mengerjakan: ${task.name}`
            });

            task.reminded = true;
        }
    });

    saveTasks();
}

// ===============================
// STATISTIK TUGAS
// ===============================
function getStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const unfinished = total - completed;

    return {
        total: total,
        completed: completed,
        unfinished: unfinished
    };
}

// ===============================
// JALANKAN SAAT HALAMAN DIBUKA
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    checkTodayTasks();

    // Cek pengingat setiap 1 menit
    setInterval(checkReminders, 60000);
});

// ===============================
// EXPORT DATA
// ===============================
function exportTasks() {
    const data = JSON.stringify(tasks, null, 2);

    const blob = new Blob(
        [data],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "tasktime-backup.json";

    a.click();

    URL.revokeObjectURL(url);
}

// ===============================
// IMPORT DATA
// ===============================
function importTasks(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            tasks = JSON.parse(e.target.result);

            saveTasks();
            renderTasks();

            alert("Data tugas berhasil diimpor! 🎉");
        } catch (error) {
            alert("File tidak valid!");
        }
    };

    reader.readAsText(file);
  }
