dev:
npm run dev

api:
npm --prefix apps/api run start:prod

smoke:
bash scripts/ci_validate.sh
