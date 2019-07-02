docker run --name ideas-db -p 3306:3306 -d -e MYSQL_ROOT_PASSWORD=secret mysql:5;

sleep 20;

cat ~/node/ideas/db/setup.sql | mysql -h 127.0.0.1 -P 3306 -u root -psecret;
