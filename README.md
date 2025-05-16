# PortfolioX

A web-based portfolio management system for showcasing and managing user projects, work samples, and creative content.

## Features

- User authentication and profile management
- Portfolio creation and management
- Portfolio item management (images, documents, etc.)
- Analytics for tracking portfolio views and engagement
- Sharing capabilities for portfolios (public links or email invites)

## Tech Stack

- **Backend**: Java Spring Boot with JPA/Hibernate
- **Database**: MySQL
- **Security**: Spring Security with JWT authentication
- **File Storage**: AWS S3
- **Email**: Spring Mail for notifications

## Getting Started

### Prerequisites

- Java 11 or higher
- MySQL
- Maven

### Installation

1. Clone the repository
```
git clone https://github.com/GoinHacky/PortfolixCapstone.git
```

2. Configure application.properties with your database and AWS credentials

3. Build and run the application
```
cd PortfolixCapstone/backend
mvn spring-boot:run
```

## API Endpoints

- **/api/auth**: Authentication endpoints
- **/api/users**: User management
- **/api/portfolios**: Portfolio management
- **/api/portfolios/{id}/items**: Portfolio item management
- **/api/analytics**: Analytics data
- **/api/share**: Sharing functionality

## License

This project is part of a capstone project for educational purposes. 