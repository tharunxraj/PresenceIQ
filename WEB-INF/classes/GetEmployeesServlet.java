import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;

public class GetEmployeesServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setHeader("Access-Control-Allow-Origin", "*");
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
            String sql = "SELECT * FROM employees";
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{");
                json.append("\"id\":"     + rs.getInt("id")              + ",");
                json.append("\"name\":\""  + rs.getString("name")        + "\",");
                json.append("\"empId\":\""  + rs.getString("emp_id")     + "\",");
                json.append("\"dept\":\""  + rs.getString("department")  + "\",");
                json.append("\"role\":\""  + rs.getString("role")        + "\",");
                json.append("\"join\":\""  + rs.getString("join_date")   + "\"");
                json.append("}");
                first = false;
            }
            con.close();

        } catch (Exception e) {
            System.out.println("Fetch Error: " + e.getMessage());
        }

        json.append("]");
        response.getWriter().print(json.toString());
    }
}