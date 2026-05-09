FROM tomcat:9.0

COPY target/attendance.war /usr/local/tomcat/webapps/ROOT.war

CMD sed -i "s/8080/${PORT}/g" /usr/local/tomcat/conf/server.xml && catalina.sh run