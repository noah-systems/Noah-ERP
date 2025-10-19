dev:
	# alvo opcional; manter caso vocês já usem outro fluxo
	@echo "Use docker/compose.dev.yml conforme sua stack de dev."

prod:
	@echo "Use docker/compose.prod.yml conforme sua stack de prod."

smoke:
	bash scripts/ci_validate.sh
