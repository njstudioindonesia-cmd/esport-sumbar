-- Initialize separate databases for each bounded microservice
CREATE DATABASE identity_db;
CREATE DATABASE news_db;
CREATE DATABASE community_db;
CREATE DATABASE event_db;
CREATE DATABASE bracket_db;
CREATE DATABASE media_db;
CREATE DATABASE notification_db;
CREATE DATABASE ai_db;

-- Grant permissions to default user
GRANT ALL PRIVILEGES ON DATABASE identity_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE news_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE community_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE event_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE bracket_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE media_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ai_db TO postgres;
