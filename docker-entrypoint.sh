#!/bin/sh
set -e

echo "[entrypoint] menunggu database siap..."
tries=0
until node -e "
const net=require('net');
const u=new URL(process.env.DATABASE_URL);
const s=net.connect(Number(u.port||5432), u.hostname);
s.on('connect',()=>{s.end();process.exit(0)});
s.on('error',()=>process.exit(1));
" 2>/dev/null; do
  tries=$((tries+1))
  if [ "$tries" -ge 60 ]; then
    echo "[entrypoint] database tidak merespons setelah 60 percobaan, keluar." >&2
    exit 1
  fi
  sleep 2
done

echo "[entrypoint] menjalankan migrasi Prisma..."
node ./node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] start: $*"
exec "$@"
