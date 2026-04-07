const token = localStorage.getItem("token");

let currentMode = "";
let userData = {};

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    // Sidebar closed by default
    document.getElementById("sidebar").style.left = "-260px";
    document.getElementById("mainContent").style.marginLeft = "0";
    document.getElementById("mainContent").style.width = "100%";

    loadDashboard();
});

/* ================= LOAD DASHBOARD ================= */

async function loadDashboard() {
    await loadProfile();
     await loadBalance();
    loadTransactions("all");
}

/* ================= PROFILE ================= */

async function loadProfile() {
    try {
        userData = await apiRequest("/user/profile");

        document.getElementById("nav-username").innerText =
            "Hi, " + userData.name;

    } catch (err) {
        console.error("Profile load error:", err);
    }
}

/* 🔹 VIEW PROFILE */

function openViewProfile() {
    document.getElementById("viewProfileModal").style.display = "block";

    document.getElementById("vp-name").innerText = userData.name;
    document.getElementById("vp-email").innerText = userData.email;
    document.getElementById("vp-phone").innerText = userData.phone_no || "N/A";
}

function closeViewProfile() {
    document.getElementById("viewProfileModal").style.display = "none";
}

/* 🔹 EDIT PROFILE */

function openEditProfile() {
    document.getElementById("editProfileModal").style.display = "block";

    document.getElementById("editName").value = userData.name;
    document.getElementById("editEmail").value = userData.email;
   document.getElementById("editPhone").value = userData.phone_no || "";
}

function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

/* 🔹 UPDATE PROFILE */

async function updateProfile() {
    const body = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        phone_no: document.getElementById("editPhone").value
    };

    try {
        await apiRequest("/user/profile", "PUT", body);

        closeEditProfile();
        loadProfile();

    } catch (err) {
        console.error("Update failed:", err);
    }
}

//load balance 
async function loadBalance() {
    try {
        const data = await apiRequest("/wallet/balance");
        document.getElementById("balance").innerText = "₹" + data.balance;
    } catch (err) {
        console.error("Balance load error:", err);
    }
}

/* ================= SIDEBAR ================= */

function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    const mc = document.getElementById("mainContent");

    if (sb.style.left === "-260px") {
        sb.style.left = "0";
        mc.style.marginLeft = "260px";
        mc.style.width = "calc(100% - 260px)";
    } else {
        sb.style.left = "-260px";
        mc.style.marginLeft = "0";
        mc.style.width = "100%";
    }
}

/* ================= MODAL ================= */

function openModal(mode) {
    currentMode = mode;

    const modal = document.getElementById("modalOverlay");
    const title = document.getElementById("modalTitle");
    const recField = document.getElementById("recipientWrapper");

    modal.style.display = "block";

    if (mode === "add") {
        title.innerText = "Add Money to Wallet";
        recField.style.display = "none";
    } else {
        title.innerText = "Send Money to User";
        recField.style.display = "block";
    }
}

function closeModal() {
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("inputRecipient").value = "";
    document.getElementById("inputAmount").value = "";
}

/* ================= TRANSACTIONS ================= */

async function loadTransactions(type) {
    try {
        let url = "/transactions/all";

        if (type === "sent") url = "/transactions/sent";
        if (type === "received") url = "/transactions/received";

        const data = await apiRequest(url);

        const tbody = document.getElementById("transactions");
        tbody.innerHTML = "";

        data.forEach(tx => {
            const row = `
    <tr>
        <td>${new Date(tx.createdAt || tx.date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</td>

       <td>${tx.senderEmail || "-"}</td>
       <td>${tx.receiverEmail || "-"}</td>

        <td class="${tx.type === 'SENT' ? 'sent' : 'received'}">
            ${tx.type === 'SENT' ? '-' : '+'}₹${tx.amount}
        </td>
    </tr>
`;
            tbody.innerHTML += row;
        });

    } catch (err) {
        console.error("Transaction load error:", err);
    }
}

/* 🔹 TAB SWITCH */

function switchTab(btn, type) {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("tab-active"));
    btn.classList.add("tab-active");

    loadTransactions(type);
}

/* ================= SUBMIT ACTION ================= */

async function submitAction() {
    const amount = document.getElementById("inputAmount").value;
    const email = document.getElementById("inputRecipient").value;

    if (!amount || amount <= 0) {
        alert("Enter valid amount");
        return;
    }

    try {
        if (currentMode === "add") {
            await apiRequest("/wallet/add-money", "POST", { amount });
           
        } else {
            if (!email) {
                alert("Enter recipient email");
                return;
            }

            await apiRequest("/wallet/transfer", "POST", {
                 receiverEmail: email,  
                  amount: parseFloat(amount)
            });
          
        }

        closeModal();
        loadDashboard();  

    } catch (err) {
        console.error("Transaction failed:", err);
    }
}

//search user api


function selectUser(email) {
    document.getElementById("inputRecipient").value = email;
    document.getElementById("searchResults").innerHTML = "";
}

async function searchUser() {
    const query = document.getElementById("inputRecipient").value;

    if (query.length < 2) {
        document.getElementById("searchResults").innerHTML = "";
        return;
    }

    try {
        const users = await apiRequest(`/user/search?query=${query}`);

        let html = "";

        users.forEach(u => {
            html += `
                <div class="search-item" onclick="selectUser('${u.email}')">
                    ${u.name} (${u.email})
                </div>
            `;
        });

        document.getElementById("searchResults").innerHTML = html;

    } catch (err) {
        console.error(err);
    }
}
/* ================= LOGOUT ================= */

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}