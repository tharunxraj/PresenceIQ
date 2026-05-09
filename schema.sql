-- AttendEase Database Schema
-- Run this in your Railway MySQL instance

CREATE DATABASE IF NOT EXISTS attendease;
USE attendease;

CREATE TABLE IF NOT EXISTS employees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  emp_id      VARCHAR(50)  NOT NULL UNIQUE,
  department  VARCHAR(100),
  role        VARCHAR(100),
  email       VARCHAR(150),
  phone       VARCHAR(20),
  join_date   DATE,
  gender      VARCHAR(20),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date        DATE NOT NULL,
  status      ENUM('Present', 'Absent', 'Late') NOT NULL,
  marked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (employee_id, date)
);