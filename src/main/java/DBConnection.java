import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {

    public static Connection getConnection() {
        Connection con = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Read from environment variables (set in Railway dashboard)
            // Falls back to localhost for local development
            String host   = getEnv("DB_HOST",     "localhost");
            String port   = getEnv("DB_PORT",     "3306");
            String dbName = getEnv("DB_NAME",     "attendease");
            String user   = getEnv("DB_USER",     "root");
            String pass   = getEnv("DB_PASSWORD", "password@123");

            String url = "jdbc:mysql://" + host + ":" + port + "/" + dbName
                       + "?useSSL=false"
                       + "&allowPublicKeyRetrieval=true"
                       + "&serverTimezone=UTC"
                       + "&useLegacyDatetimeCode=false";

            con = DriverManager.getConnection(url, user, pass);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return con;
    }

    private static String getEnv(String key, String defaultVal) {
        String val = System.getenv(key);
        return (val != null && !val.isEmpty()) ? val : defaultVal;
    }
}