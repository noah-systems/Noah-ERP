.PHONY: dev prod smoke

dev:
	bash scripts/dev-up.sh

prod:
	bash scripts/prod-up.sh

smoke:
	bash scripts/ci_validate.sh
