import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class GetAttendanceServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");

        Connection con = DBConnection.getConnection();
        StringBuilder json = new StringBuilder();
        json.append("[");

        if (con == null) {
            json.append("]");
            response.getWriter().print(json.toString());
            return;
        }

        try {
            // join attendance with employees to get name and emp_id
            String sql = "SELECT a.id, e.name, e.emp_id, e.department, a.date, a.status "
                       + "FROM attendance a "
                       + "JOIN employees e ON a.employee_id = e.id "
                       + "ORDER BY a.date DESC";

            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{");
                json.append("\"id\":"      + rs.getInt("id")              + ",");
                json.append("\"name\":\""  + rs.getString("name")         + "\",");
                json.append("\"empId\":\""  + rs.getString("emp_id")      + "\",");
                json.append("\"dept\":\""  + rs.getString("department")   + "\",");
                json.append("\"date\":\""  + rs.getString("date")         + "\",");
                json.append("\"status\":\"" + rs.getString("status")      + "\"");
                json.append("}");
                first = false;
            }
            con.close();

        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }

        json.append("]");
        response.getWriter().print(json.toString());
    }
}