npx prisma migrate dev --name init
npx prisma studio
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ sudo chown $USER:$USER data/redis/dump.rdb
[sudo] password for dipesh: 
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ sudo chmod u+rw data/redis/dump.rdb
dipesh@dipesh-Inspiron-3501:~/Desktop/summarizevideoai$ 
sudo chown -R dipesh:dipesh data/db/
sudo chmod -R 755 data/db/
sudo chmod 644 data/redis/dump.rdb

 npx prisma migrate dev
npx prisma migrate dev --create-only
python3 -m venv myenv
source myenv/bin/activate
pip install prophet pandas fastapi uvicorn

uvicorn prophet_server:app --host 0.0.0.0 --port 8000



