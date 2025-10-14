
  # Noah ERP Mockups

  This is a code bundle for Noah ERP Mockups. The original project is available at https://www.figma.com/design/7bPowTaiTuZjAda0gbT0aL/Noah-ERP-Mockups.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Manutenção do ambiente com Docker

  Para reproduzir rapidamente a sequência de atualização utilizada em produção,
  execute o script `scripts/update_and_rebuild.sh`. Ele realiza o stash das
  alterações locais, atualiza a branch via `git pull --rebase` e reconstrói os
  serviços Docker definidos em `docker/compose.prod.yml`, garantindo também que
  as migrations Prisma e o usuário administrador padrão sejam aplicados.
  