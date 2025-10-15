FROM postgres:16-alpine

COPY ensure-noah.sh /usr/local/bin/ensure-noah.sh
RUN chmod +x /usr/local/bin/ensure-noah.sh

ENTRYPOINT ["ensure-noah.sh"]
CMD ["postgres"]
