# File: portfolioX-backend/Dockerfile
# Multi-stage Dockerfile: build with Maven, produce lean runtime image
FROM maven:3.9.5-eclipse-temurin-17 as build
WORKDIR /app

# copy pom and download dependencies (cache)
COPY pom.xml ./
# if you have a settings.xml, COPY it here
RUN mvn -B -f pom.xml -q dependency:go-offline

# copy source and build
COPY src ./src
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw || true
RUN mvn -B -DskipTests package

# runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy jar from build stage (adjust jar name pattern if different)
COPY --from=build /app/target/*.jar app.jar

# optionally create a directory for uploads (will be ephemeral unless persistent disk/S3 used)
RUN mkdir -p /app/uploads

# Expose port (match spring.server.port)
EXPOSE 8080

# Use a non-root user (optional)
USER 1000:1000

# Start command
ENTRYPOINT ["java","-jar","/app/app.jar"]
