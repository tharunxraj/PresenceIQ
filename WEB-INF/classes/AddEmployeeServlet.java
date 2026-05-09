import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.sql.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class AddEmployeeServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String name     = request.getParameter("name");
        String empId    = request.getParameter("empId");
        String dept     = request.getParameter("dept");
        String role     = request.getParameter("role");
        String email    = request.getParameter("email");
        String phone    = request.getParameter("phone");
        String joinDate = request.getParameter("joinDate");
        String gender   = request.getParameter("gender");

        try {
            Connection con = DBConnection.getConnection();

            if (con == null) {
                response.getWriter().print("error:DB connection failed");
                return;
            }

            String sql = "INSERT INTO employees(name,emp_id,department,role,email,phone,join_date,gender) VALUES(?,?,?,?,?,?,?,?)";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, name);
            ps.setString(2, empId);
            ps.setString(3, dept);
            ps.setString(4, role);
            ps.setString(5, email == null ? "" : email);
            ps.setString(6, phone == null ? "" : phone);
            ps.setString(7, joinDate);
            ps.setString(8, gender == null ? "" : gender);
            ps.executeUpdate();
            con.close();
            response.getWriter().print("success");

        } catch (Exception e) {
            response.getWriter().print("error:" + e.getMessage());
        }
    }
}