

<div align="center">

# Hair by Sentle

An online storefront for premium hair, bundles, and local installation bookings.

</div>

## About

Hair by Sentle gives customers a dedicated place to browse hair products, manage a shopping cart, and learn about installation services. The project combines a responsive static frontend with a Java REST API and a SQLite database. It is designed to help the business present its products and services independently online.

## Features

- Responsive storefront with product, collection, about, contact, and installation pages.
- Product browsing and a cart saved in the browser's local storage.
- Account registration, login, and email verification endpoints.
- REST API endpoints for products, appointments, and order checkout.
- SQLite persistence for the backend.
- Configurable CORS origins and email settings for deployment environments.

> **Checkout status:** The current browser checkout presents a demo order confirmation; it does not process a real card payment or submit the order to the backend.

## Technology

- **Frontend:** HTML, CSS, and vanilla JavaScript.
- **Backend:** Java 17, Spring Boot 3, Spring Web, Spring Data JPA, and Bean Validation.
- **Database:** SQLite with Hibernate's community SQLite dialect.
- **Build and tests:** Maven and Spring Boot Test.

## Project layout

```text
backend/   Spring Boot API, database schema, seed data, and tests
docs/      Project documentation and workspace files
frontend/  Static storefront pages, styles, scripts, and assets
```

## Run locally

### Backend

Requirements: JDK 17 and Maven.

From the repository root, start the API:

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080` by default. The application initializes its SQLite schema and seed data at startup. The default database file is `backend/database/hairbysentle-app.db` when started from the `backend` directory.

### Frontend

Serve the `frontend/` directory with a local static web server (for example, VS Code Live Server) and open `index.html`. Account registration and login currently call the backend at `http://localhost:8080`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register an account |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/auth/verify?token=...` | Verify an email address |
| `GET` | `/api/products` | List active products |
| `GET` | `/api/products/{productId}` | Get an active product |
| `POST` | `/api/appointments` | Create an appointment |
| `POST` | `/api/orders/checkout` | Submit an order to the API |

## Configuration

The backend has local defaults in `backend/src/main/resources/application.properties`. Configure environment variables rather than committing credentials:

| Variable | Purpose |
| --- | --- |
| `SPRING_DATASOURCE_URL` | Override the SQLite JDBC URL |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `APP_VERIFICATION_BASE_URL` | Base URL used in email-verification links |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | Email delivery settings |
| `OWNER_WHATSAPP_PHONE` | Business WhatsApp contact number |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` | Optional Twilio WhatsApp configuration |

## Tests

Run the backend test suite from the `backend/` directory:

```bash
mvn test
```

## Deployment

The application is structured as a static frontend and a separately runnable Spring Boot backend. Set the deployed frontend origin in `APP_CORS_ALLOWED_ORIGINS`, provide production email/database configuration through environment variables, and deploy each component to your chosen hosting platform. Add the public site and API URLs here once deployment is finalized.

## WeThinkCode_ Cloud Computing proof of work

Verification code: **WTC-GZ9Q3H8B**

## Developer

**Siyamthanda Ndzipha**  
[LinkedIn](https://www.linkedin.com/in/siyamthanda-ndzipha-b8364a299/) · [GitHub](https://github.com/Ndzipha-devloveper)


