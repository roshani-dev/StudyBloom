
let taskInput = document.getElementById("task-input");
let subjectInput = document.getElementById("subject-input");
let addTaskButton = document.getElementById("add-task-btn");
let taskList = document.getElementById("task-list");

let taskCount = document.getElementById("task-count");
let pendingCount = document.getElementById("pending-count");
let completedCount = document.getElementById("completed-count");

function saveTasks() {
    if (taskList) {
        localStorage.setItem("studyTasks", taskList.innerHTML);
    }
}

function saveCompletionDate(li) {
    if (li.classList.contains("completed")) {
        let today = new Date();

        let date =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        li.dataset.completedDate = date;
    } else {
        delete li.dataset.completedDate;
    }

    saveTasks();
}

function updateTaskCount() {
    if (!taskList || !taskCount) return;

    let totalTasks = taskList.querySelectorAll(".delete-btn").length;
    taskCount.innerText = "Total Tasks: " + totalTasks;
}

function updateSummaryCounts() {
    if (!taskList) return;

    let totalTasks = taskList.querySelectorAll(".delete-btn").length;
    let completedTasks = taskList.querySelectorAll(".completed .delete-btn").length;
    let pendingTasks = totalTasks - completedTasks;

    if (pendingCount) {
        pendingCount.innerText = pendingTasks;
    }

    if (completedCount) {
        completedCount.innerText = completedTasks;
    }
}

function attachTaskEvents(li) {
    let completeButton = li.querySelector(".complete-btn");
    let deleteButton = li.querySelector(".delete-btn");

    if (completeButton) {
        completeButton.addEventListener("click", function() {
            li.classList.toggle("completed");
            saveCompletionDate(li);
            updateTaskCount();
            updateSummaryCounts();
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", function() {
            li.remove();

            if (taskList.children.length === 0) {
                taskList.innerHTML = "<li>No tasks added yet. Start by adding one! 🌷</li>";
            }

            saveTasks();
            updateTaskCount();
            updateSummaryCounts();
        });
    }
}

if (taskList && addTaskButton && taskInput && subjectInput) {

    let savedTasks = localStorage.getItem("studyTasks");

    if (savedTasks !== null) {
        taskList.innerHTML = savedTasks;
    }

    taskList.querySelectorAll("li").forEach(function(li) {

        if (li.innerText.includes("No tasks added yet")) {
            return;
        }

        if (!li.querySelector(".task-actions")) {
            let actions = document.createElement("div");
            actions.className = "task-actions";
            actions.innerHTML = `
                <button class="complete-btn">Complete</button>
                <button class="delete-btn">Delete</button>
            `;

            li.appendChild(actions);
        }

        if (!li.querySelector(".complete-btn")) {
            let actions = li.querySelector(".task-actions");
            let button = document.createElement("button");
            button.className = "complete-btn";
            button.innerText = "Complete";
            actions.appendChild(button);
        }

        if (!li.querySelector(".delete-btn")) {
            let actions = li.querySelector(".task-actions");
            let button = document.createElement("button");
            button.className = "delete-btn";
            button.innerText = "Delete";
            actions.appendChild(button);
        }

        attachTaskEvents(li);
    });

    updateTaskCount();
    updateSummaryCounts();

    addTaskButton.addEventListener("click", function() {

        let task = taskInput.value.trim();
        let subject = subjectInput.value;

        if (task === "" || subject === "") {
            alert("Please enter a task and select a subject!");
            return;
        }

        if (taskList.innerText.includes("No tasks added yet")) {
            taskList.innerHTML = "";
        }

        let li = document.createElement("li");

        li.innerHTML = `
            <strong>${task}</strong>
            <span class="subject-badge">${subject}</span>
            <div class="task-actions">
                <button class="complete-btn">Complete</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        taskList.appendChild(li);

        attachTaskEvents(li);

        saveTasks();
        updateTaskCount();
        updateSummaryCounts();

        taskInput.value = "";
        subjectInput.value = "";
    });

    let filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(function(button) {

        button.addEventListener("click", function() {

            let filter = button.dataset.filter;

            taskList.querySelectorAll("li").forEach(function(li) {

                if (!li.querySelector(".delete-btn")) {
                    li.style.display = filter === "all" ? "block" : "none";
                    return;
                }

                let isCompleted = li.classList.contains("completed");

                if (filter === "all") {
                    li.style.display = "flex";
                } else if (filter === "completed") {
                    li.style.display = isCompleted ? "flex" : "none";
                } else if (filter === "pending") {
                    li.style.display = isCompleted ? "none" : "flex";
                }
            });

            filterButtons.forEach(function(btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");
        });
    });
}

let progressCompleted = document.getElementById("progress-completed");
let progressPending = document.getElementById("progress-pending");
let overallPercentage = document.getElementById("overall-percentage");
let overallProgressBar = document.getElementById("overall-progress-bar");

let weeklyBars = [
    document.querySelector(".mon-bar"),
    document.querySelector(".tue-bar"),
    document.querySelector(".wed-bar"),
    document.querySelector(".thu-bar"),
    document.querySelector(".fri-bar"),
    document.querySelector(".sat-bar"),
    document.querySelector(".sun-bar")
];

function getSavedTasks() {
    let savedTasks = localStorage.getItem("studyTasks");
    let tempDiv = document.createElement("div");

    if (savedTasks) {
        tempDiv.innerHTML = savedTasks;
    }

    return tempDiv;
}

function updateProgressPage() {
    let tempDiv = getSavedTasks();

    let totalTasks = tempDiv.querySelectorAll(".delete-btn").length;
    let completedTasks = tempDiv.querySelectorAll(".completed .delete-btn").length;
    let pendingTasks = totalTasks - completedTasks;

    progressCompleted.innerText = completedTasks;
    progressPending.innerText = pendingTasks;

    let percentage = 0;

    if (totalTasks > 0) {
        percentage = Math.round((completedTasks / totalTasks) * 100);
    }

    overallPercentage.innerText = percentage + "%";
    overallProgressBar.style.width = percentage + "%";
}

function updateWeeklyActivity() {
    let tempDiv = getSavedTasks();

    let dailyCounts = [0, 0, 0, 0, 0, 0, 0];

    let today = new Date();
    let monday = new Date(today);
    let day = today.getDay();

    let difference = day === 0 ? -6 : 1 - day;

    monday.setDate(today.getDate() + difference);
    monday.setHours(0, 0, 0, 0);

    tempDiv.querySelectorAll("li.completed").forEach(function(li) {

        let completedDate = li.dataset.completedDate;

        if (!completedDate) return;

        let taskDate = new Date(completedDate + "T00:00:00");

        let index = Math.round(
            (taskDate - monday) / (1000 * 60 * 60 * 24)
        );

        if (index >= 0 && index < 7) {
            dailyCounts[index]++;
        }
    });

    let maxCount = Math.max(...dailyCounts);

    weeklyBars.forEach(function(bar, index) {

        if (!bar) return;

        if (maxCount > 0) {
            let height = (dailyCounts[index] / maxCount) * 100;
            bar.style.height = height + "%";
        } else {
            bar.style.height = "0%";
        }
    });
}

function updateSubjectProgress() {
    let tempDiv = getSavedTasks();

    let subjects = {
        DSA: ["DSA"],
        Java: ["Java"],
        Web: ["Web Development"],
        Others: ["English", "Project"]
    };

    for (let category in subjects) {

        let total = 0;
        let completed = 0;

        tempDiv.querySelectorAll("li").forEach(function(li) {

            let badge = li.querySelector(".subject-badge");

            if (!badge) return;

            let subject = badge.innerText.trim();

            if (subjects[category].includes(subject)) {
                total++;

                if (li.classList.contains("completed")) {
                    completed++;
                }
            }
        });

        let percentage = 0;

        if (total > 0) {
            percentage = Math.round((completed / total) * 100);
        }

        let bar = document.getElementById(
            category.toLowerCase() + "-progress-bar"
        );

        let text = document.getElementById(
            category.toLowerCase() + "-progress-text"
        );

        if (bar) {
            bar.style.width = percentage + "%";
        }

        if (text) {
            text.innerText = percentage + "%";
        }
    }
}

function updateStudyStreak() {
    let tempDiv = getSavedTasks();

    let completedDates = [];

    tempDiv.querySelectorAll("li.completed").forEach(function(li) {

        let date = li.dataset.completedDate;

        if (date && !completedDates.includes(date)) {
            completedDates.push(date);
        }
    });

    completedDates.sort().reverse();

    let today = new Date();

    let currentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    function formatDate(date) {
        return date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");
    }

    let todayString = formatDate(currentDate);

    let yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);

    let yesterdayString = formatDate(yesterday);

    let streak = 0;

    let startDate = null;

    if (completedDates.includes(todayString)) {
        startDate = new Date(currentDate);
    } else if (completedDates.includes(yesterdayString)) {
        startDate = new Date(yesterday);
    }

    if (startDate) {

        let checkDate = new Date(startDate);

        while (true) {

            let dateString = formatDate(checkDate);

            if (completedDates.includes(dateString)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    let streakElement = document.getElementById("study-streak");

    if (streakElement) {
        streakElement.innerText =
            streak + (streak === 1 ? " Day" : " Days");
    }
}

if (
    progressCompleted &&
    progressPending &&
    overallPercentage &&
    overallProgressBar
) {
    updateProgressPage();
}

if (weeklyBars.every(function(bar) {
    return bar !== null;
})) {
    updateWeeklyActivity();
}

if (document.getElementById("dsa-progress-bar")) {
    updateSubjectProgress();
}

if (document.getElementById("study-streak")) {
    updateStudyStreak();
}
//profile page

let userName = document.getElementById("user-name");
let userEmail = document.getElementById("user-email");
let saveProfileButton = document.getElementById("save-profile-btn");
let notificationToggle = document.getElementById("notification-toggle");
let resetDataButton = document.getElementById("reset-data-btn");

if (userName && userEmail && saveProfileButton) {

    userName.value = localStorage.getItem("studyUserName") || "";
    userEmail.value = localStorage.getItem("studyUserEmail") || "";

    saveProfileButton.addEventListener("click", function() {

        let name = userName.value.trim();
        let email = userEmail.value.trim();

        if (name === "" || email === "") {
            alert("Please enter your name and email!");
            return;
        }

        localStorage.setItem("studyUserName", name);
        localStorage.setItem("studyUserEmail", email);

        alert("Your profile has been saved successfully! 💗");
    });
}

if (notificationToggle) {

    let savedNotification = localStorage.getItem("studyNotifications");

    notificationToggle.checked = savedNotification === "true";

    notificationToggle.addEventListener("change", function() {

        localStorage.setItem(
            "studyNotifications",
            notificationToggle.checked
        );

        if (notificationToggle.checked) {
            alert("Study reminders enabled! 🔔");
        } else {
            alert("Study reminders disabled.");
        }
    });
}

if (resetDataButton) {

    resetDataButton.addEventListener("click", function() {

        let confirmReset = confirm(
            "Are you sure you want to delete all your study tasks?"
        );

        if (confirmReset) {

            localStorage.removeItem("studyTasks");

            alert("All study tasks have been cleared! 🌸");

        }
    });
}
let welcomeUser = document.getElementById("welcome-user");

if (welcomeUser) {
    let savedName = localStorage.getItem("studyUserName");

    if (savedName) {
        welcomeUser.textContent = "Hello, " + savedName + "! 👋";
    } else {
        welcomeUser.textContent = "Hello, User! 👋";
    }
}

let focusTimerDisplay = document.getElementById("focus-timer");
let focusStartButton = document.getElementById("focus-start");
let focusPauseButton = document.getElementById("focus-pause");
let focusResetButton = document.getElementById("focus-reset");
let focusMessage = document.getElementById("focus-message");

if (focusTimerDisplay && focusStartButton && focusPauseButton && focusResetButton) {

    let focusTime = 25 * 60;
    let focusInterval = null;

    function updateFocusTimer() {
        let minutes = Math.floor(focusTime / 60);
        let seconds = focusTime % 60;

        focusTimerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");
    }

    focusStartButton.addEventListener("click", function() {

        if (focusInterval !== null || focusTime === 0) {
            return;
        }

        focusMessage.textContent = "Stay focused! You are doing great. 💗";

        focusInterval = setInterval(function() {

            focusTime--;
            updateFocusTimer();

            if (focusTime <= 0) {
                clearInterval(focusInterval);
                focusInterval = null;
                focusMessage.textContent = "Amazing! You completed your focus session! 🎉";
                alert("Congratulations! Your focus session is complete! 🌸");
            }

        }, 1000);
    });

    focusPauseButton.addEventListener("click", function() {

        clearInterval(focusInterval);
        focusInterval = null;

        focusMessage.textContent = "Timer paused. Take a little break! 💗";
    });

    focusResetButton.addEventListener("click", function() {

        clearInterval(focusInterval);
        focusInterval = null;

        focusTime = 25 * 60;
        updateFocusTimer();

        focusMessage.textContent = "Believe in yourself. You can do it! 💗";
    });

    updateFocusTimer();
}

