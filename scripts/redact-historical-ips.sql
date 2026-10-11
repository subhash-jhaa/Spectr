-- Run after taking a database backup. Removes previously retained full IPs.
UPDATE "Event" SET "ip" = 'Unknown' WHERE "ip" <> 'Unknown';
