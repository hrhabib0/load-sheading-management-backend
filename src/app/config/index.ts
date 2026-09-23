import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    node_env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
    redis_user: process.env.REDIS_USER!,
    redis_password: process.env.REDIS_PASSWORD!,
    redis_host: process.env.REDIS_HOST!,
    redis_port: process.env.REDIS_PORT!,
    smtp_user: process.env.SMTP_USER!,
    smtp_password: process.env.SMTP_PASSWORD!,
    email_sender: process.env.EMAIL_SENDER!,
    tester_admin_email: process.env.TESTER_ADMIN_EMAIL!,
    tester_admin_password: process.env.TESTER_ADMIN_PASSWORD!,
    tester_zone_manager_email: process.env.TESTER_ZONE_MANAGER_EMAIL!,
    tester_zone_manager_password: process.env.TESTER_ZONE_MANAGER_PASSWORD!,
    tester_power_operator_email: process.env.TESTER_POWER_OPERATOR_EMAIL!,
    tester_power_operator_password: process.env.TESTER_POWER_OPERATOR_PASSWORD!,
    tester_operator_email: process.env.TESTER_OPERATOR_EMAIL!,
    tester_operator_password: process.env.TESTER_OPERATOR_PASSWORD!,
    tester_technician_email: process.env.TESTER_TECHNICIAN_EMAIL!,
    tester_technician_password: process.env.TESTER_TECHNICIAN_PASSWORD!,
}