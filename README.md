PresenceIQ – Smart Employee Attendance Management System
A full-stack web application to track, manage and analyse employee attendance in real time.

🌐 Live Demo: presenceiq-production-0c61.up.railway.app

✨ Features

✅ Add Employees — Register employees with full details (name, ID, department, role, email, phone)
✅ Mark Attendance — Mark each employee as Present, Late or Absent for any date
✅ View Records — Search and filter attendance records by name, date range or status
✅ Monthly Report — View attendance percentage for each employee by month
✅ Live Dashboard — Real-time overview of today's attendance stats
✅ Fully Deployed — Hosted on Railway with cloud MySQL database


🛠️ Tech Stack
LayerTechnologyBackendJava Servlets (Jakarta EE)ServerApache Tomcat 9DatabaseMySQL 9.4FrontendHTML5, CSS3, Vanilla JavaScriptDeploymentRailway (Docker + Maven)Build ToolMaven

🗂️ Project Structure
PresenceIQ/
├── Dockerfile
├── pom.xml
├── railway.toml
└── src/
    └── main/
        ├── java/
        │   ├── AddEmployeeServlet.java
        │   ├── DBConnection.java
        │   ├── GetAttendanceServlet.java
        │   ├── GetEmployeesServlet.java
        │   └── MarkAttendanceServlet.java
        └── webapp/
            ├── WEB-INF/
            │   └── web.xml
            ├── index.html
            ├── add-employee.html
            ├── mark-attendance.html
            ├── view-records.html
            ├── style.css
            └── script.js

🚀 Run Locally
Prerequisites

Java 11+
Maven
MySQL
Apache Tomcat 9

Steps

Clone the repo

bashgit clone https://github.com/tharunxraj/PresenceIQ.git
cd PresenceIQ

Create the database

sqlCREATE DATABASE attendease;
USE attendease;
-- Run schema.sql

Update DB credentials in DBConnection.java
Build the WAR file

bashmvn clean package

Deploy target/attendease.war to Tomcat webapps folder
Open http://localhost:8080


🌐 API Endpoints
MethodEndpointDescriptionPOST/addEmployeeAdd a new employeeGET/getEmployeesGet all employeesPOST/markAttendanceMark attendance for a dateGET/getAttendanceGet all attendance records

👨‍💻 Author
Tharun raj

GitHub: @tharunxraj


📄 License
This project is open source and available under the MIT License.
