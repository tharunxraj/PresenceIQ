// ============================================
//   AttendEase - script.js
//   Full frontend logic - Java + MySQL
// ============================================
 
window.onload = function () {
  showTodayDate();
  loadCurrentPage();
};
 
// ---- show today's date in navbar ----
function showTodayDate() {
  var today = new Date();
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var el = document.getElementById('navDate');
  if (el) el.textContent = today.toLocaleDateString('en-IN', options);
}
 
// ---- figure out which page we are on ----
function loadCurrentPage() {
  var path = window.location.pathname;
 
  if (path.includes('add-employee')) {
    setTodayDate('empJoin');
    loadEmployeesFromDB();
 
  } else if (path.includes('mark-attendance')) {
    setTodayDate('attendDate');
    renderAttendanceTable();
 
  } else if (path.includes('view-records')) {
    renderRecordsTable();
 
  } else {
    loadDashboardStats();
  }
}
 
// ---- set today's date in a date input ----
function setTodayDate(id) {
  var el = document.getElementById(id);
  if (el) el.value = getTodayISO();
}
 
function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}
 
// ---- convert date DD-MM-YYYY to YYYY-MM-DD if needed ----
function convertDate(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) return dateStr;
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}
 
 
// ============================================
//   DASHBOARD
// ============================================
 
function loadDashboardStats() {
  var today = getTodayISO();
 
  fetch('/attendance/getAttendance')
  .then(function(r) { return r.json(); })
  .then(function(records) {
    fetch('/attendance/getEmployees')
    .then(function(r) { return r.json(); })
    .then(function(employees) {
 
      // only count today's records
      var todayRecs = records.filter(function(r) { return r.date === today; });
 
      // present + late both count as present for dashboard
      var present = todayRecs.filter(function(r) {
        return r.status === 'Present' || r.status === 'Late';
      }).length;
 
      var total  = employees.length;
      var absent = total - present;
      if (absent < 0) absent = 0;
      var rate = total > 0 ? Math.round((present / total) * 100) : 0;
 
      setText('presentCount', present);
      setText('absentCount',  absent);
      setText('totalCount',   total);
      setText('rateText',     rate + ' %');
 
      setTimeout(function() {
        var bar = document.getElementById('progFill');
        if (bar) bar.style.width = rate + '%';
      }, 300);
    });
  });
}
 
 
// ============================================
//   ADD EMPLOYEE PAGE
// ============================================
 
function addEmployee() {
  var name   = val('empName');
  var empId  = val('empId');
  var dept   = val('empDept');
  var role   = val('empRole');
  var email  = val('empEmail');
  var phone  = val('empPhone');
  var join   = val('empJoin');
  var gender = val('empGender');
 
  if (!name || !empId || !dept || !role || !join) {
    showAlert('msgErr', '❌ Please fill all required fields.');
    return;
  }
 
  var params = 'name='      + encodeURIComponent(name)              +
               '&empId='    + encodeURIComponent(empId)             +
               '&dept='     + encodeURIComponent(dept)              +
               '&role='     + encodeURIComponent(role)              +
               '&email='    + encodeURIComponent(email)             +
               '&phone='    + encodeURIComponent(phone)             +
               '&joinDate=' + encodeURIComponent(convertDate(join)) +
               '&gender='   + encodeURIComponent(gender);
 
  fetch('/attendance/addEmployee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })
  .then(function(r) { return r.text(); })
  .then(function(result) {
    if (result === 'success') {
      showAlert('msgOk', '✅ Employee added successfully!');
      clearInputs(['empName','empId','empDept','empRole',
                   'empEmail','empPhone','empJoin','empGender']);
      loadEmployeesFromDB();
    } else {
      showAlert('msgErr', '❌ Error: ' + result);
    }
  })
  .catch(function(err) {
    showAlert('msgErr', '❌ Server error: ' + err);
  });
}
 
function clearForm() {
  clearInputs(['empName','empId','empDept','empRole',
               'empEmail','empPhone','empJoin','empGender']);
  hideAlerts();
}
 
// load employees from MySQL and show in table
function loadEmployeesFromDB() {
  fetch('/attendance/getEmployees')
  .then(function(r) { return r.json(); })
  .then(function(list) {
    var tbody = document.getElementById('empTbody');
    var label = document.getElementById('empCountLabel');
    if (!tbody) return;
    if (label) label.textContent = list.length + ' employee(s) registered';
 
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No employees added yet.</td></tr>';
      return;
    }
 
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      html += '<tr>';
      html += '<td>' + (i+1)   + '</td>';
      html += '<td>' + e.name  + '</td>';
      html += '<td>' + e.empId + '</td>';
      html += '<td>' + e.dept  + '</td>';
      html += '<td>' + e.role  + '</td>';
      html += '<td>' + e.join  + '</td>';
      html += '</tr>';
    }
    tbody.innerHTML = html;
  });
}
 
 
// ============================================
//   MARK ATTENDANCE PAGE
// ============================================
 
// load employees and show Present / Late / Absent toggles
function renderAttendanceTable() {
  fetch('/attendance/getEmployees')
  .then(function(r) { return r.json(); })
  .then(function(list) {
    var tbody = document.getElementById('attendTbody');
    if (!tbody) return;
 
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No employees found. Please add employees first.</td></tr>';
      return;
    }
 
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      html += '<tr>';
      html += '<td>' + (i+1)   + '</td>';
      html += '<td>' + e.empId + '</td>';
      html += '<td>' + e.name  + '</td>';
      html += '<td>' + e.dept  + '</td>';
      html += '<td>';
      html += '<div class="tog-switch">';
      html += '<button class="tog-btn p-on" id="p_' + e.empId + '" onclick="toggleStatus(\'' + e.empId + '\', \'Present\')">✅ Present</button>';
      html += '<button class="tog-btn"      id="l_' + e.empId + '" onclick="toggleStatus(\'' + e.empId + '\', \'Late\')">🕐 Late</button>';
      html += '<button class="tog-btn"      id="a_' + e.empId + '" onclick="toggleStatus(\'' + e.empId + '\', \'Absent\')">❌ Absent</button>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';
    }
    tbody.innerHTML = html;
  });
}
 
// toggle Present / Late / Absent
function toggleStatus(empId, status) {
  var pBtn = document.getElementById('p_' + empId);
  var lBtn = document.getElementById('l_' + empId);
  var aBtn = document.getElementById('a_' + empId);
 
  // remove all highlights first
  if (pBtn) pBtn.classList.remove('p-on');
  if (lBtn) lBtn.classList.remove('l-on');
  if (aBtn) aBtn.classList.remove('a-on');
 
  // highlight the selected one
  if (status === 'Present' && pBtn) pBtn.classList.add('p-on');
  if (status === 'Late'    && lBtn) lBtn.classList.add('l-on');
  if (status === 'Absent'  && aBtn) aBtn.classList.add('a-on');
}
 
// get all employee IDs shown in table
function getEmployeesFromTable() {
  var rows = document.querySelectorAll('#attendTbody tr');
  var ids  = [];
  rows.forEach(function(row) {
    var btn = row.querySelector('.tog-btn');
    if (btn) ids.push(btn.id.replace('p_', ''));
  });
  return ids;
}
 
// save attendance to MySQL
function saveAttendance() {
  var date = val('attendDate');
  if (!date) { alert('Please select a date!'); return; }
 
  var employees = getEmployeesFromTable();
  if (employees.length === 0) { alert('No employees found!'); return; }
 
  // build: EMP001:Present,EMP002:Late,EMP003:Absent
  var recordsStr = '';
  for (var i = 0; i < employees.length; i++) {
    var empId  = employees[i];
    var lBtn   = document.getElementById('l_' + empId);
    var aBtn   = document.getElementById('a_' + empId);
    var status = 'Present';
    if (lBtn && lBtn.classList.contains('l-on')) status = 'Late';
    if (aBtn && aBtn.classList.contains('a-on')) status = 'Absent';
    if (i > 0) recordsStr += ',';
    recordsStr += empId + ':' + status;
  }
 
  var params = 'date='     + encodeURIComponent(date)        +
               '&records=' + encodeURIComponent(recordsStr);
 
  fetch('/attendance/markAttendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })
  .then(function(r) { return r.text(); })
  .then(function(result) {
    var alertEl = document.getElementById('saveAlert');
    if (result === 'success') {
      if (alertEl) {
        alertEl.textContent = '✅ Attendance saved successfully!';
        alertEl.classList.remove('hidden');
        setTimeout(function() { alertEl.classList.add('hidden'); }, 3000);
      }
    } else {
      alert('Error saving: ' + result);
    }
  });
}
 
 
// ============================================
//   VIEW RECORDS PAGE
// ============================================
 
// switch between All Records and Monthly Report tabs
function switchTab(tab) {
  var recPanel = document.getElementById('panelRecords');
  var monPanel = document.getElementById('panelMonthly');
  var recBtn   = document.getElementById('tabRecords');
  var monBtn   = document.getElementById('tabMonthly');
 
  if (tab === 'records') {
    recPanel.style.display = 'block';
    monPanel.style.display = 'none';
    recBtn.classList.add('active');
    monBtn.classList.remove('active');
  } else {
    recPanel.style.display = 'none';
    monPanel.style.display = 'block';
    monBtn.classList.add('active');
    recBtn.classList.remove('active');
    loadMonthlyReport();
  }
}
 
// load all attendance records from MySQL
function renderRecordsTable() {
  fetch('/attendance/getAttendance')
  .then(function(r) { return r.json(); })
  .then(function(list) {
    window.allRecords = list; // store for filtering
    filterRecords();
  });
}
 
// filter records by name, date range, status
function filterRecords() {
  var nameQ    = document.getElementById('searchName')   ? document.getElementById('searchName').value.toLowerCase().trim() : '';
  var dateFrom = document.getElementById('dateFrom')     ? document.getElementById('dateFrom').value   : '';
  var dateTo   = document.getElementById('dateTo')       ? document.getElementById('dateTo').value     : '';
  var statusQ  = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';
 
  var records  = window.allRecords || [];
 
  var filtered = records.filter(function(r) {
    var okName   = !nameQ    || r.name.toLowerCase().includes(nameQ);
    var okFrom   = !dateFrom || r.date >= dateFrom;
    var okTo     = !dateTo   || r.date <= dateTo;
    var okStatus = !statusQ  || r.status === statusQ;
    return okName && okFrom && okTo && okStatus;
  });
 
  var tbody   = document.getElementById('recordsTbody');
  var counter = document.getElementById('recordCount');
  if (!tbody) return;
 
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No records found.</td></tr>';
    if (counter) counter.textContent = 'Showing 0 records';
    return;
  }
 
  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var r  = filtered[i];
    var bc = 'badge badge-p';
    if (r.status === 'Absent') bc = 'badge badge-a';
    if (r.status === 'Late')   bc = 'badge badge-l';
    html += '<tr>';
    html += '<td>' + (i+1)   + '</td>';
    html += '<td>' + r.empId + '</td>';
    html += '<td>' + r.name  + '</td>';
    html += '<td>' + r.dept  + '</td>';
    html += '<td>' + r.date  + '</td>';
    html += '<td><span class="' + bc + '">' + r.status + '</span></td>';
    html += '</tr>';
  }
 
  tbody.innerHTML = html;
  if (counter) counter.textContent = 'Showing ' + filtered.length + ' record(s)';
}
 
function clearFilters() {
  ['searchName','dateFrom','dateTo','filterStatus'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  filterRecords();
}
 
 
// ============================================
//   MONTHLY REPORT TAB
// ============================================
 
function loadMonthlyReport() {
  var month = document.getElementById('monthSelect') ? document.getElementById('monthSelect').value : '05';
  var year  = document.getElementById('yearInput')   ? document.getElementById('yearInput').value.trim() : '2026';
  var tbody = document.getElementById('monthlyTbody');
  if (!tbody) return;
 
  fetch('/attendance/getAttendance')
  .then(function(r) { return r.json(); })
  .then(function(records) {
    fetch('/attendance/getEmployees')
    .then(function(r) { return r.json(); })
    .then(function(employees) {
 
      if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No employees found.</td></tr>';
        return;
      }
 
      // only records for selected month and year
      var monthRecords = records.filter(function(r) {
        return r.date && r.date.startsWith(year + '-' + month);
      });
 
      var html = '';
      for (var i = 0; i < employees.length; i++) {
        var e       = employees[i];
        var empRecs = monthRecords.filter(function(r) { return r.empId === e.empId; });
        var present = empRecs.filter(function(r) { return r.status === 'Present'; }).length;
        var late    = empRecs.filter(function(r) { return r.status === 'Late';    }).length;
        var absent  = empRecs.filter(function(r) { return r.status === 'Absent';  }).length;
        var total   = empRecs.length;
        var pct     = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
 
        // color code based on percentage
        var pctClass = pct >= 75 ? 'pct-high' : (pct >= 50 ? 'pct-mid' : 'pct-low');
 
        html += '<tr>';
        html += '<td>' + (i+1)    + '</td>';
        html += '<td>' + e.empId  + '</td>';
        html += '<td>' + e.name   + '</td>';
        html += '<td>' + e.dept   + '</td>';
        html += '<td>' + present  + '</td>';
        html += '<td>' + late     + '</td>';
        html += '<td>' + absent   + '</td>';
        html += '<td><span class="' + pctClass + '">' + pct + '%</span></td>';
        html += '</tr>';
      }
 
      tbody.innerHTML = html;
    });
  });
}
 
 
// ============================================
//   HELPER FUNCTIONS
// ============================================
 
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
 
function setText(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}
 
function clearInputs(ids) {
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
}
 
function showAlert(id, message) {
  hideAlerts();
  var el = document.getElementById(id);
  if (!el) return;
  if (message) el.textContent = message;
  el.classList.remove('hidden');
  if (id === 'msgOk') {
    setTimeout(function() { el.classList.add('hidden'); }, 3000);
  }
}
 
function hideAlerts() {
  ['msgOk', 'msgErr'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}