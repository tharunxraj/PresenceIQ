FROM tomcat:9.0

COPY target/attendance.war /usr/local/tomcat/webapps/attendance.war

EXPOSE 8080

CMD ["catalina.sh", "run"]