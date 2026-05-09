import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class MarkAttendanceServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String date     = request.getParameter("date");
        String records  = request.getParameter("records");

        // records comes as: EMP001:Present,EMP002:Absent,EMP003:Present
        try {
            Connection con = DBConnection.getConnection();
            if (con == null) {
                response.getWriter().print("error:DB connection failed");
                return;
            }

            // first delete existing records for this date
            String deleteSql = "DELETE FROM attendance WHERE date = ?";
            PreparedStatement delPs = con.prepareStatement(deleteSql);
            delPs.setString(1, date);
            delPs.executeUpdate();

            // then insert new records
            String[] entries = records.split(",");
            for (String entry : entries) {
                String[] parts = entry.split(":");
                if (parts.length == 2) {
                    String empId  = parts[0].trim();
                    String status = parts[1].trim();

                    // get employee id from emp_id
                    String getIdSql = "SELECT id FROM employees WHERE emp_id = ?";
                    PreparedStatement getPs = con.prepareStatement(getIdSql);
                    getPs.setString(1, empId);
                    ResultSet rs = getPs.executeQuery();

                    if (rs.next()) {
                        int employeeId = rs.getInt("id");
                        String insertSql = "INSERT INTO attendance(employee_id, date, status) VALUES(?,?,?)";
                        PreparedStatement insPs = con.prepareStatement(insertSql);
                        insPs.setInt(1, employeeId);
                        insPs.setString(2, date);
                        insPs.setString(3, status);
                        insPs.executeUpdate();
                    }
                }
            }

            con.close();
            response.getWriter().print("success");

        } catch (Exception e) {
            response.getWriter().print("error:" + e.getMessage());
        }
    }
}