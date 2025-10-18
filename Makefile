.PHONY: dev qa prod smoke migrate seed

DEV_SCRIPT=./scripts/install_dev.sh
PROD_SCRIPT=./scripts/install_prod.sh

## Prepara dependências locais e valida builds mínimos
dev:
	$(DEV_SCRIPT)

## Provisiona stack docker.prod e executa smoke tests (QA)
qa:
	$(PROD_SCRIPT)

## Alias para qa (deploy completo)
prod:
	$(PROD_SCRIPT)

## Executa smoke tests sem reinstalar dependências
smoke:
	./scripts/ci_validate.sh

## Aplica migrations no banco configurado
migrate:
	npm --prefix apps/api run prisma:migrate:deploy

## Executa seed oficial do Prisma
seed:
	npm --prefix apps/api run prisma:seed
