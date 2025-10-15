FROM postgres:16-alpine

# When building via docker-compose the build context is set to the repository
# root's parent directory. The helper script lives alongside this Dockerfile
# under docker/apps/db/, so we need to copy it using the full relative path
# from the context root instead of assuming it is at the root itself.
COPY docker/apps/db/ensure-noah.sh /usr/local/bin/ensure-noah.sh
RUN chmod +x /usr/local/bin/ensure-noah.sh

ENTRYPOINT ["ensure-noah.sh"]
CMD ["postgres"]
