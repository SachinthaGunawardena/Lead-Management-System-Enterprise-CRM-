const API_URL = "http://localhost:5000/api";
const currentPage = window.location.pathname;

/* =====================================================
   ================= LOGIN PAGE =========================
===================================================== */
if (currentPage.includes("login.html")) {
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          message.style.color = "red";
          message.innerText = data.message;
          return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } catch (error) {
        message.style.color = "red";
        message.innerText = "Server error";
      }
    });
  }
}

/* =====================================================
   ================= DASHBOARD PAGE =====================
===================================================== */
if (currentPage.includes("dashboard.html")) {
  const leadsTable = document.getElementById("leadsTable");
  const leadForm = document.getElementById("leadForm");
  const logoutBtn = document.getElementById("logout");
  const searchInput = document.getElementById("searchInput");

  const token = localStorage.getItem("token");

  // 🔒 Protect dashboard

  if (!token) {
    window.location.href = "login.html";
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let allLeads = [];

  /* ================= LOAD LEADS ================= */
  const loadLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "GET",
        headers: authHeaders, // ✅ USE THIS
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }

      const data = await res.json();
      allLeads = data.leads;
      renderLeads(allLeads);
    } catch (error) {
      leadsTable.innerHTML = `<tr><td colspan="5" style="color:red">Failed to load leads</td></tr>`;
    }
  };
  /* ================= RENDER LEADS ================= */
  const renderLeads = (leads) => {
    leadsTable.innerHTML = "";

    if (!leads || leads.length === 0) {
      leadsTable.innerHTML = `<tr><td colspan="5">No leads found</td></tr>`;
      return;
    }

    leads.forEach((lead) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email || "-"}</td>
        <td>${lead.phone}</td>
        <td>
          <select class="statusSelect">
            ${["New", "Contacted", "Qualified", "Converted"]
              .map(
                (status) => `
                  <option value="${status}" ${
                    lead.status === status ? "selected" : ""
                  }>
                    ${status}
                  </option>
                `,
              )
              .join("")}
          </select>
        </td>
        <td>
          <button class="deleteBtn">Delete</button>
        </td>
      `;

      leadsTable.appendChild(row);

      /* ===== STATUS UPDATE ===== */
      const statusSelect = row.querySelector(".statusSelect");

      statusSelect.addEventListener("change", async () => {
        try {
          await fetch(`${API_URL}/leads/${lead._id}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify({ status: statusSelect.value }),
          });

          loadLeads();
        } catch (error) {
          alert("Failed to update status");
        }
      });

      /* ===== DELETE LEAD ===== */
      const deleteBtn = row.querySelector(".deleteBtn");

      deleteBtn.addEventListener("click", async () => {
        if (!confirm(`Delete ${lead.name}?`)) return;

        try {
          const res = await fetch(`${API_URL}/leads/${lead._id}`, {
            method: "DELETE",
            headers: authHeaders,
          });

          if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
          }

          loadLeads();
        } catch (error) {
          alert("Failed to delete lead");
        }
      });
    });
  };

  /* ================= SEARCH ================= */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();

      const filtered = allLeads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          (lead.email && lead.email.toLowerCase().includes(query)) ||
          lead.phone.includes(query),
      );

      renderLeads(filtered);
    });
  }

  /* ================= CREATE LEAD ================= */
  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;

      try {
        await fetch(`${API_URL}/leads`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ name, email, phone }),
        });

        leadForm.reset();
        loadLeads();
      } catch (error) {
        alert("Failed to create lead");
      }
    });
  }

  /* ================= LOGOUT ================= */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  /* ================= INITIAL LOAD ================= */
  loadLeads();
}
