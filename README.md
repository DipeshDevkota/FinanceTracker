npx prisma migrate dev --name init
npx prisma studio
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ sudo chown $USER:$USER data/redis/dump.rdb
[sudo] password for dipesh: 
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ sudo chmod u+rw data/redis/dump.rdb
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ 
sudo chown -R dipesh:dipesh data/db/
sudo chmod -R 755 data/db/
 npx prisma migrate dev
npx prisma migrate dev --create-only

